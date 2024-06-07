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


### 선수뽑기
 
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


### 스쿼드 수정
 
> ![](https://img.shields.io/static/v1?label=&message=PUT&color=orange) <br>
> /**api/users/squard/:squardId**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| playerPoolId | int | 해당하는 playerPoolId | **Required** |

#### Response
 
  <details markdown="1">
  <summary>200 OK : 성공적으로 수정된 경우</summary>
  
  ```
  {
    "id": 26,
    "userId": 55,
    "playerPoolId": "50",
  }

  ```

  </details>
  
  <details markdown="1">
  <summary>400 Bad Request : 다른 유저가 사용중인 playerPoolId일 경우</summary>
   
  ```
  {
    "error": "이 playerPool은 이미 다른 Squard와 연결되어 있습니다.",
  }

  ```

  </details>
  
</details>
<br>


### 스쿼드 삭제
 
> ![](https://img.shields.io/static/v1?label=&message=DELETE&color=red) <br>
> /**api/users/squard/:squardId**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| playerPoolId | int | 해당하는 playerPoolId | **Required** |

#### Response
 
  <details markdown="1">
  <summary>204 No Content : 성공적으로 삭제된 경우</summary>
  
  ```
  {
  }

  ```

  </details>
  
  <details markdown="1">
  <summary>500 Internal Server Error : playerPoolId가 스쿼드에 없는 경우</summary>
   
  ```
  {
    "error": "스쿼드 삭제 중 오류가 발생했습니다.",
  }

  ```

  </details>
  
</details>
<br>


### 선수강화
 
> ![](https://img.shields.io/static/v1?label=&message=PATCH&color=yellow) <br>
> /**api/upgrade**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |
| upgradePlayerName | string | 강화할 선수 이름 | **Required** |
| upgradePlayerId | string | 강화할 선수의 id | **Required** |
| sacrificePlayerName | string | 강화 재료로 사용할 선수의 이름 | **Required** |
| sacrificePlayerId | string | 강화 재료로 사용할 선수의 id | **Required** |

#### Response
 
  <details markdown="1">
  <summary>200 Ok : 성공적으로 강화가 된 경우</summary>
  
  ```
  {
	"message": "F. Lampard선수의 강화가 성공했습니다."
  }

  ```
  </details>
  <details markdown="1">
  <summary>400 Bad Request : 올바른 입력 값이 아닌 경우</summary>
   
  ```
  {
	"message": "다음을 통해 강화하려는 선수와 재료로 쓰일 선수를 선택해주세요 \n            data: [{\"id\":45,\"userId\":55,\"playerId\":20,\"createdAt\":\"2024-06-07T02:41:12.316Z\",\"playerLevel\":1,\"playerName\":\"R. 	 
        Mason\",\"count\":1,\"sidelined\":false,\"stamina\":100},{\"id\":46,\"userId\":55,\"playerId\":236,\"createdAt\":\"2024-06-07T02:51:32.756Z\",\"playerLevel\":1,\"playerName\":\"D. Rose\",\"count\":1,\"sidelined\":false,\"stamina\":100}, 
        {\"id\":47,\"userId\":55,\"playerId\":481,\"createdAt\":\"2024-06-07T02:51:33.806Z\",\"playerLevel\":1,\"playerName\":\"J. Wilshere\",\"count\":1,\"sidelined\":false,\"stamina\":100},{\"id\":48,\"userId\":55,\"playerId\":738,\"createdAt\":\"2024-06- 
        07T02:51:35.364Z\",\"playerLevel\":1,\"playerName\":\"O. Hargreaves\",\"count\":1,\"sidelined\":false,\"stamina\":100},{\"id\":49,\"userId\":55,\"playerId\":13,\"createdAt\":\"2024-06-07T02:51:35.914Z\",\"playerLevel\":1,\"playerName\":\"F. 
        Lampard\",\"count\":1,\"sidelined\":false,\"stamina\":100},{\"id\":50,\"userId\":55,\"playerId\":111,\"createdAt\":\"2024-06-07T02:51:36.468Z\",\"playerLevel\":1,\"playerName\":\"A. Young\",\"count\":1,\"sidelined\":false,\"stamina\":100}]\n            level 1 
        단계 >>> 2단계 : 강화 확률= 100%    제물선수의 조건 : 1level 선수 1명\n            level 2 단계 >>> 3단계 : 강화 확률= 50%     제물선수의 조건 : 2level 선수 2명\n            level 3 단계 >>> 4단계 : 강화 확률= 25%     제물선수의 조건 : 3level 선수 3명\n            "
  }

  ```

  </details>
  
</details>
<br>


### 경기시작
 
> ![](https://img.shields.io/static/v1?label=&message=POST&color=brightgreen) <br>
> /**api/games/play**

<details markdown="1">
<summary>detail</summary>
 
#### Parameters
 
##### Body

| name | type | description | required |
| :---: | :---: | :---: | :---: |

#### Response
 
  <details markdown="1">
  <summary>201 Created : 성공적 경기가 된 경우</summary>
  
  ```
  {
    "message": "5 : 3로 승리!"
  }
  ```
  </details>
  <details markdown="1">
  <summary>404 Not Found : 사용자의 스쿼드에 선수가 3명 미만일 경우</summary>
   
  ```
  {
    "message": "사용자의 스쿼드가 올바르지 않습니다"
  }
  ```

  </details>

  <details markdown="1">
  <summary>400 Bad Request : 스쿼드에 stamina가 0이거나 sideline이 true인 선수가 있는 경우</summary>
   
  ```
  {
    "message": "스쿼드에 경기를 뛸 수 없는 선수가 있습니다",
  }
  ```

  </details>

  <details markdown="1">
  <summary>404 Not Found : 매칭 상대를 찾을 수 없는 경우</summary>
   
  ```
  {
    "message": "매칭 상대를 찾을 수 없습니다.",
  }
  ```

  </details>
  
</details>
<br>
