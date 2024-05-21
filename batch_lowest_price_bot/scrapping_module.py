# urllib 는 HTTP또는 FTP를 사용하여 데이털르 다운로드 할 수 있음
## urllib.request 모듈은 웹 사이트에 있는 데이터에 접근하는 기능을 제공
## 인증, 리다이렉트, 쿠키와 같은 요청처리 지원

# 라이브러리 적재
import urllib.request as req
import urllib.parse as parse
from bs4 import BeautifulSoup

# 코드예시 005930 = 삼성전자

# HTMl 가져오기
url = "https://finance.naver.com/item/main.naver?code=005930" 
# Encode the URL components that may contain non-ASCII characters
# encoded_query = parse.quote("위닉스 뽀송 DN2H160-IWK")
# encoded_url = url.replace("위닉스+뽀송+DN2H160-IWK", encoded_query)
res = req.urlopen(url)
# HTML 분석하기
soup = BeautifulSoup(res,"html.parser")

# 원하는 데이터 추출하기
price = soup.select_one("div > p.no_today > em > span.blind").text
print("usd/krw =",price)