# NBC-Teamproject03-futsalsimulator
내일배움캠프 Nodejs 3차 팀프로젝트 풋살 시뮬레이터


# 일반 API 명세
 
![](https://img.shields.io/static/v1?label=&message=GET&color=blue)
![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen)
![](https://img.shields.io/static/v1?label=&message=PUT&color=orange)
![](https://img.shields.io/static/v1?label=&message=PATCH&color=yellow)
![](https://img.shields.io/static/v1?label=&message=DELETE&color=red)

### 예제: 로그인
 
> ![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen) <br>
> /**api/sign-in**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| uid | string | 로그인 할 사용자의 아이디 | **Required** |
| password | string | 로그인 할 사용자의 비밀번호 | **Required** |

#### Response
 
  <details markdown="1">
  <summary>200 Ok : 성공적으로 로그인 된 경우</summary>
  
  ```
  {
    "message": "user님 환영합니다",
    "cash": 현재 캐쉬,
    "createdAt": "현재 날짜",
    "token": "token 정보"
  }
  ```
  <summary>401 Ok : 아이디, 비밀번호가 틀릴 때</summary>
  ```
  {
    "message": "인증 실패",
  }
  ```
  </details>
</details>
<br>
