import json
import urllib.request
from bs4 import BeautifulSoup

def lambda_handler(event, context):
    url = "https://www.marketwatch.com/investing/stock/spot/"
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    a_tags = soup.find_all('bg-quote',{"class":"value"})
    result_list = []
    for i in a_tags:
        result_list.append(i.get_text())
    return {
        'statusCode': 200,
        'body': json.dumps(result_list)
    }