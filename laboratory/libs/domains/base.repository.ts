// libs/database/src/common/base.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import type { Knex } from 'knex';

@Injectable()
export abstract class BaseRepository<T extends Record<string, any>> {
  @InjectKnex()
  protected readonly knex: Knex;

  constructor(
    protected readonly tableName: string,
    protected readonly primaryKey: string = 'idx',
  ) {}

  async findAll(select: string[] = ['*']): Promise<T[]> {
    return this.knex(this.tableName).select(...select) as Promise<T[]>;
  }

  async findOne(
    conditions: Partial<T>,
    select: string[] = ['*'],
  ): Promise<T | undefined> {
    return this.knex(this.tableName)
      .select(...select)
      .where(conditions)
      .first() as Promise<T | undefined>;
  }

  async findById(id: number, select: string[] = ['*']): Promise<T | undefined> {
    return this.knex(this.tableName)
      .select(...select)
      .where(this.primaryKey, id)
      .first() as Promise<T | undefined>;
  }

  async create(data: Omit<T, 'idx'>): Promise<T> {
    const [id] = await this.knex(this.tableName)
      .insert(data)
      .returning(this.primaryKey);

    const result = await this.findById(id);
    if (!result) {
      throw new Error(`Could not find created entity with id ${id}`);
    }

    return result;
  }

  async update(
    id: number,
    data: Partial<Omit<T, 'idx'>>,
  ): Promise<T | undefined> {
    await this.knex(this.tableName).where(this.primaryKey, id).update(data);

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const count = await this.knex(this.tableName)
      .where(this.primaryKey, id)
      .delete();

    return count > 0;
  }

  // 추가적인 공통 메서드 (페이지네이션, 집계 함수 등)
  async findWithPagination(
    page: number = 1,
    perPage: number = 10,
    conditions: Partial<T> = {},
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }> {
    const offset = (page - 1) * perPage;

    const [countResult] = await this.knex(this.tableName)
      .where(conditions)
      .count(`${this.primaryKey} as count`);

    const total = parseInt(countResult.count as string);

    const data = (await this.knex(this.tableName)
      .where(conditions)
      .limit(perPage)
      .offset(offset)) as T[];

    const lastPage = Math.ceil(total / perPage);

    return {
      data,
      total,
      page,
      perPage,
      lastPage,
    };
  }
}
