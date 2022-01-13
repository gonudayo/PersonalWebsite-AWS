import json
import urllib.request
from bs4 import BeautifulSoup

def lambda_handler(event, context):
    url = "https://www.marketwatch.com/investing/stock/spot/"
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    tags = soup.find_all('bg-quote',{"class":"value"})
    stock = tags[0].get_text()
    return {
        'statusCode': 200,
        'body': stock,
    }