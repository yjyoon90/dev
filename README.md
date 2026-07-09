# 수도권 청약 캘린더 🏢

서울·경기·인천 수도권의 **아파트·오피스텔 청약 일정과 상세정보**를 한눈에 볼 수 있는 반응형 웹앱입니다.
한국부동산원 **청약홈 공공데이터(공공데이터포털)** 를 기반으로 하며, 크롤링 없이 공식 Open API만 사용합니다.

> PC·모바일 모두 지원하는 PWA로, 모바일에서 "홈 화면에 추가"하면 앱처럼 사용할 수 있습니다.

## 주요 기능

- 📅 **청약 캘린더 / 목록** 두 가지 보기 (접수 시작일 기준 달력)
- ⏱ **접수 임박순 정렬 + D-day 배지** (마감 D-3, 오늘마감 등)
- 🔎 **지역(서울/경기/인천) → 시/군/구**, 유형(APT/무순위/오피스텔), 상태(접수중/예정/마감) 필터 + 단지명 검색
- 📄 **상세 페이지** — 공급규모, 시행사, 입주예정, 청약 일정 타임라인, 청약홈 공고 원문 링크
- 📊 **청약 경쟁률** — 주택형·순위·거주지별 경쟁률 표 (당첨자 발표된 건)
- 🗺 **카카오 지도** — 단지 위치 지도(키 있을 때) / 카카오맵 검색 링크(폴백)
- ⭐ **관심단지 즐겨찾기** (브라우저 localStorage 저장)
- 🟢 진행 상태 자동 배지(접수중/예정/마감)

## 빠른 시작

```bash
npm install
npm run dev       # http://localhost:3000
```

인증키가 없어도 **샘플 데이터**로 바로 화면을 확인할 수 있습니다.

## 실제 청약 데이터 연결하기 (공공데이터 인증키)

1. [공공데이터포털](https://www.data.go.kr) 회원가입
2. **[한국부동산원_청약홈 분양정보 조회 서비스](https://www.data.go.kr/data/15098547/openapi.do)** 페이지에서 **활용신청** (무료, 보통 즉시~1일 승인)
3. 발급받은 **일반 인증키(Decoding)** 를 `.env.local` 에 넣기:

```bash
cp .env.example .env.local
# .env.local 파일을 열어 아래처럼 입력
# APPLYHOME_SERVICE_KEY=발급받은_키
```

4. 서버를 재시작하면 실제 수도권 청약 데이터가 표시됩니다. (샘플 배너 사라짐)

인증키는 **서버에서만** 사용되며 브라우저로 노출되지 않습니다.

## 사용하는 공공 API

`lib/api.ts` 에서 아래 세 엔드포인트를 호출하고 `SUBSCRPT_AREA_CODE_NM` 이 `서울`/`경기`인 건만 필터링합니다.

| 유형 | 엔드포인트 |
|------|-----------|
| APT 분양정보 | `getAPTLttotPblancDetail` |
| 무순위/잔여세대 | `getRemndrLttotPblancDetail` |
| 오피스텔·도시형·민간임대 | `getUrbtyOfctlLttotPblancDetail` |

베이스 URL: `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1`

## 기술 스택

- **Next.js 16** (App Router) — 화면 + 서버 사이드 API 호출을 한 프로젝트에서
- **React 19 + TypeScript**
- **Tailwind CSS**
- 상태 저장: 브라우저 localStorage (별도 DB 불필요)

## 배포

[Vercel](https://vercel.com)에 무료로 배포할 수 있습니다.
프로젝트를 import 한 뒤 환경변수 `APPLYHOME_SERVICE_KEY` 만 등록하면 됩니다.

## 프로젝트 구조

```
app/
  layout.tsx              # 공통 레이아웃 + 헤더/푸터
  page.tsx                # 메인(목록/캘린더)
  subscription/[id]/      # 청약 상세
  manifest.ts             # PWA manifest
lib/
  api.ts                  # 청약홈 공공 API 클라이언트 (+ 샘플 폴백)
  mockData.ts             # 인증키 없을 때 샘플 데이터
  types.ts, format.ts     # 타입 / 날짜·상태 포맷
components/               # Header, 카드, 캘린더, 필터, 즐겨찾기 등
context/FavoritesContext  # 관심단지 상태(localStorage)
```

## 참고 / 유의사항

- 표시 정보는 **참고용**입니다. 실제 청약 전 반드시 [청약홈](https://www.applyhome.co.kr) 공고 원문을 확인하세요.
- 보안: 최신 **Next.js 16 + React 19** 를 사용합니다. 직접 의존성은 `npm audit` 클린이며, 남아 있는 moderate 권고 1건은 Next.js가 내부적으로 번들한 postcss 버전(빌드 타임 전용)에서 발생하는 것으로, Next.js 패치 릴리스로만 해소됩니다(앱 런타임에 노출되지 않음).

## 데이터 출처

- 한국부동산원 청약홈 분양정보 조회 서비스 — 공공데이터포털 (https://www.data.go.kr/data/15098547/openapi.do)
