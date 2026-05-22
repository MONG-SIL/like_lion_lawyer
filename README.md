# like_lion_lawyer

법무부 공공데이터 **마을변호사·마을담당공무원 지역별 배정현황** 조회 앱입니다.

<img width="1920" height="1243" alt="스크린샷 2026-05-22 오후 2 54 24" src="https://github.com/user-attachments/assets/41ac5c49-9334-4696-a572-d77e6a5f8880" />
<img width="1920" height="1243" alt="스크린샷 2026-05-22 오후 2 54 16" src="https://github.com/user-attachments/assets/9b9395b1-03ca-41bd-b946-edc147203bda" />
<img width="1920" height="1243" alt="스크린샷 2026-05-22 오후 2 54 05" src="https://github.com/user-attachments/assets/71a00691-428a-4126-b546-10cb62144703" />

## 기능

- 마을변호사 지역별 배정현황 조회
- 시·도 / 지역명 / 변호사·공무원명 검색
- 배정 상세 정보 (위촉지역, 마을변호사, 담당공무원)
- API 테스트 페이지 (XML 응답 확인)

## 기술 스택

- React + Vite
- Tailwind CSS
- Axios / Fetch
- fast-xml-parser

## 실행 방법

```bash
npm install
```

`.env` 파일 생성 (공공데이터포털 인증키):

```env
VITE_API_URL=/api/moj
VITE_API_KEY=발급받은_디코딩_키
```

```bash
npm run dev
```

## API

- [법무부_마을변호사 지역별 현황](https://www.data.go.kr/data/15121954/openapi.do)
- Endpoint: `https://apis.data.go.kr/1270000/mojmabyun/mabyun`
