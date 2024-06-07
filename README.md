# NBC-Teamproject03-futsalsimulator
내일배움캠프 Nodejs 3차 팀프로젝트 풋살 시뮬레이터


# API 명세
 
![](https://img.shields.io/static/v1?label=&message=GET&color=blue)
![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen)
![](https://img.shields.io/static/v1?label=&message=PUT&color=orange)
![](https://img.shields.io/static/v1?label=&message=PATCH&color=yellow)
![](https://img.shields.io/static/v1?label=&message=DELETE&color=red)

### 로그인
 
> ![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen) <br>
> /**api/sign-in**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| accountName | string | 로그인 할 사용자의 아이디 | **Required** |
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
  </details>
  <details markdown="1">
  <summary>401 Unauthorized : 아이디, 비밀번호가 틀릴 때</summary>
   
  ```
  {
    "message": "인증 실패",
  }
  ```

  </details>
  
</details>
<br>


### 회원가입
 
> ![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen) <br>
> /**api/sign-up**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| accountName | string | 회원가입 할 사용자의 아이디 | **Required** |
| password | string | 회원가입 할 사용자의 비밀번호 | **Required** |

#### Response
 
  <details markdown="1">
  <summary>201 Created : 성공적으로 회원가입 된 경우</summary>
  
  ```
  {
    "message": "user님 환영합니다",
    "cash": 현재 캐쉬,
    "createdAt": "현재 날짜",
    "token": "token 정보"
  }
  ```
  </details>
  <details markdown="1">
  <summary>400 Bad Request : 아이디를 영소문자나 숫자로 입력하지 않은 경우</summary>
   
  ```
  {
    "message": "영소문자와 숫자로만 입력하세요",
  }
  ```

  </details>

  <details markdown="1">
  <summary>400 Bad Request : 비밀번호를 6자 이상으로 입력하지 않은 경우</summary>
   
  ```
  {
    "message": "6자 이상으로 입력하세요",
  }
  ```

  </details>
  
</details>
<br>

### 캐쉬추가
 
> ![](https://img.shields.io/static/v1?label=&message=PATCH&color=yellow) <br>
> /**api/user/cash**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| deposit | int | 추가할 금액 | **Required** |

#### Response
 
  <details markdown="1">
  <summary>201 Created : 성공적으로 회원가입 된 경우</summary>
  
  ```
  {

  }
  ```

  </details>
  
</details>
<br>


### 카드뽑기
 
> ![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen) <br>
> /**api/DrawCard**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| nationality | string | 국가 | **Required** |

#### Response
 
  <details markdown="1">
  <summary>200 ok : 성공적으로 카드를 뽑음 </summary>
  
  ```
  {
	   "message": "R. Mason선수가 뽑혔습니다.",
	   "data": {
		   "id": 45,
		   "userId": 55,
		   "playerId": 20,
		   "createdAt": "2024-06-07T02:41:12.316Z",
		   "playerLevel": 1,
		   "playerName": "R. Mason",
		   "count": 1,
		   "sidelined": false,
		   "stamina": 100
	   },
	   "cash": 9000
  }
  ```

  </details>
  <details markdown="1">
  <summary>500 Internal Server Error : 올바르지 않은 국가를 입력한 경우</summary>
   
  ```
  {
    "message": "패키지 구매 중 에러가 발생했습니다.",
  }
  ```

  </details>
  
</details>
<br>


### 스쿼드 생성
 
> ![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen) <br>
> /**api/users/squard**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| playerPoolId | int | playerPoolId값 | **Required** |

#### Response
 
  <details markdown="1">
  <summary>200 ok : 성공적으로 스쿼드를 생성 </summary>
  
  ```
  {
	"squardId": 28
  }
  ```

  </details>
  <details markdown="1">
  <summary>500 Internal Server Error : 올바르지 않은 id를 입력한 경우</summary>
   
  ```
  {
    "message": "스쿼드 생성 중 오류가 발생했습니다.",
  }
  ```

  </details>
  
</details>
<br>


### 스쿼드 조회
> ![](https://img.shields.io/static/v1?label=&message=GET&color=blue) <br>
> /**api/users/squard/:userId**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |

#### Response
 
  <details markdown="1">
  <summary>200 ok : 성공적으로 스쿼드 조회 </summary>
  
  ```
  [
	{
		"id": 26,
		"userId": 55,
		"playerPoolId": 46,
		"playerPool": {
			"id": 46,
			"userId": 55,
			"playerId": 236,
			"createdAt": "2024-06-07T02:51:32.756Z",
			"playerLevel": 1,
			"playerName": "D. Rose",
			"count": 1,
			"sidelined": false,
			"stamina": 100
		}
	},...
  ]

  ```

  </details>
  <details markdown="1">
  <summary>500 Internal Server Error : 올바르지 않은 id를 입력한 경우</summary>
   
  ```
  {
    "message": "스쿼드 생성 중 오류가 발생했습니다.",
  }
  ```

  </details>
  
</details>
<br>
