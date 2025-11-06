# My Trip - 유저 플로우 (User Flow)

> PRD.md 및 tour_schema.sql 기반 유저 플로우 다이어그램

---

## 1. 전체 유저 플로우 개요

```mermaid
flowchart TD
    Start([사용자 접속]) --> CheckAuth{"인증 상태 확인"}
    CheckAuth -->|비로그인| Home1["홈페이지<br/>관광지 목록"]
    CheckAuth -->|로그인| Home2["홈페이지<br/>관광지 목록"]

    Home1 --> Explore1[관광지 탐색]
    Home2 --> Explore2[관광지 탐색]

    Explore1 --> Filter["필터/검색 사용"]
    Explore2 --> Filter

    Filter --> List[관광지 목록 표시]
    List --> Map[네이버 지도 표시]

    List --> Detail["상세페이지<br/>/places/[contentId]"]
    Map --> Detail

    Detail --> Action{"액션 선택"}

    Action -->|공유| Share[URL 복사 공유]
    Action -->|북마크| BookmarkCheck{"인증 확인"}
    Action -->|길찾기| Navigation[네이버 지도 길찾기]
    Action -->|뒤로가기| List

    BookmarkCheck -->|비로그인| LoginPrompt[로그인 유도]
    BookmarkCheck -->|로그인| BookmarkAction["북마크 추가/삭제"]

    LoginPrompt --> Login[로그인 페이지]
    Login --> BookmarkAction

    BookmarkAction --> Bookmarks["북마크 목록<br/>/bookmarks"]
    Bookmarks --> Detail

    Share --> End([완료])
    Navigation --> End
    BookmarkAction --> End

    style Start fill:#e1f5fe
    style End fill:#c8e6c9
    style Login fill:#fff3e0
    style BookmarkAction fill:#f3e5f5
```

---

## 2. 비로그인 유저 플로우 (기본 탐색)

```mermaid
flowchart TD
    Start([사용자 접속]) --> Home["홈페이지<br/>기본 관광지 목록 표시"]

    Home --> Option{"선택 옵션"}

    Option -->|지역 필터| FilterRegion["지역 선택<br/>시/도 단위"]
    Option -->|관광 타입| FilterType["관광 타입 선택<br/>관광지/문화시설/음식점 등"]
    Option -->|키워드 검색| Search["검색창 입력<br/>관광지명/주소/설명"]
    Option -->|지도 보기| ShowMap["네이버 지도 표시<br/>마커 표시"]
    Option -->|카드 클릭| Detail[상세페이지 이동]

    FilterRegion --> List1[필터링된 목록 표시]
    FilterType --> List1
    Search --> List1
    List1 --> ShowMap
    List1 --> Detail

    ShowMap --> MapClick{"지도 상호작용"}
    MapClick -->|마커 클릭| MapInfo["인포윈도우 표시<br/>상세보기 버튼"]
    MapInfo --> Detail

    Detail --> DetailAction{"상세페이지 액션"}
    DetailAction -->|공유| Share["URL 복사<br/>토스트 메시지"]
    DetailAction -->|길찾기| Nav[네이버 지도 길찾기]
    DetailAction -->|북마크 시도| NoAuth[로그인 필요 안내]
    DetailAction -->|뒤로가기| Home

    NoAuth --> LoginPrompt[로그인 유도 다이얼로그]
    LoginPrompt --> LoginChoice{"로그인 선택"}
    LoginChoice -->|로그인| Login[로그인 페이지]
    LoginChoice -->|취소| Detail

    Share --> End([종료])
    Nav --> End
    DetailAction --> End

    style Start fill:#e1f5fe
    style End fill:#c8e6c9
    style Login fill:#fff3e0
    style NoAuth fill:#ffebee
```

---

## 3. 로그인 유저 플로우 (북마크 포함)

```mermaid
flowchart TD
    Start([로그인 사용자 접속]) --> Sync["사용자 동기화<br/>Clerk → Supabase"]
    Sync --> Home["홈페이지<br/>관광지 목록"]

    Home --> Explore["관광지 탐색<br/>필터/검색/지도"]
    Explore --> Detail["상세페이지<br/>/places/[contentId]"]

    Detail --> CheckBookmark{"북마크 상태 확인<br/>Supabase 조회"}
    CheckBookmark -->|북마크 있음| ShowBookmarked[별 아이콘 채움]
    CheckBookmark -->|북마크 없음| ShowEmpty[별 아이콘 빈 상태]

    ShowBookmarked --> BookmarkClick{북마크 클릭}
    ShowEmpty --> BookmarkClick

    BookmarkClick -->|제거| RemoveBookmark[Supabase 북마크 삭제<br/>bookmarks 테이블 DELETE]
    BookmarkClick -->|추가| AddBookmark[Supabase 북마크 추가<br/>bookmarks 테이블 INSERT]

    RemoveBookmark --> UpdateUI1[UI 업데이트<br/>별 아이콘 빈 상태]
    AddBookmark --> UpdateUI2[UI 업데이트<br/>별 아이콘 채움]

    UpdateUI1 --> OtherActions[기타 액션 가능<br/>공유/길찾기]
    UpdateUI2 --> OtherActions

    OtherActions --> NavToBookmarks{"북마크 목록 이동"}
    NavToBookmarks -->|북마크 페이지로| BookmarksPage["북마크 목록<br/>/bookmarks"]
    NavToBookmarks -->|상세페이지 계속| Detail

    BookmarksPage --> BookmarkList[북마크한 관광지 목록<br/>Supabase에서 조회]
    BookmarkList --> BookmarkActions{북마크 목록 액션}

    BookmarkActions -->|정렬 변경| Sort[최신순/이름순/지역별 정렬]
    BookmarkActions -->|카드 클릭| Detail
    BookmarkActions -->|일괄 삭제| BatchDelete[선택 항목 삭제<br/>Supabase DELETE]
    BookmarkActions -->|개별 삭제| SingleDelete[개별 북마크 삭제]

    Sort --> BookmarkList
    BatchDelete --> RefreshList[목록 새로고침]
    SingleDelete --> RefreshList
    RefreshList --> BookmarkList

    style Start fill:#e1f5fe
    style Sync fill:#e8f5e9
    style AddBookmark fill:#f3e5f5
    style RemoveBookmark fill:#ffebee
    style BookmarksPage fill:#fff3e0
```

---

## 4. 검색 및 필터 플로우

```mermaid
flowchart TD
    Start([홈페이지 접속]) --> InitLoad["초기 데이터 로드<br/>areaBasedList2 API"]
    InitLoad --> Display[기본 관광지 목록 표시]

    Display --> UserAction{"사용자 액션"}

    UserAction -->|키워드 입력| SearchInput[검색창에 키워드 입력]
    UserAction -->|지역 선택| RegionFilter["지역 필터 선택<br/>areaCode2 API로 지역 목록 조회"]
    UserAction -->|타입 선택| TypeFilter["관광 타입 필터 선택<br/>ContentTypeId 선택"]
    UserAction -->|정렬 변경| SortOption["정렬 옵션 선택<br/>최신순/이름순"]

    SearchInput --> SearchSubmit{"검색 실행"}
    SearchSubmit -->|엔터/검색 버튼| SearchAPI[searchKeyword2 API 호출]

    RegionFilter --> FilterAPI1["areaBasedList2 API 호출<br/>areaCode 파라미터 추가"]
    TypeFilter --> FilterAPI2["areaBasedList2 API 호출<br/>contentTypeId 파라미터 추가"]

    SearchAPI --> Combine{"필터 조합"}
    FilterAPI1 --> Combine
    FilterAPI2 --> Combine
    SortOption --> Combine

    Combine --> CombinedAPI["조합된 API 호출<br/>키워드 + 지역 + 타입 + 정렬"]

    CombinedAPI --> Results{결과 확인}

    Results -->|결과 있음| ShowResults[검색/필터 결과 표시<br/>목록 + 지도 마커 업데이트]
    Results -->|결과 없음| EmptyState[결과 없음 안내<br/>필터 초기화 제안]

    ShowResults --> MapUpdate[지도 마커 업데이트<br/>KATEC 좌표 변환]
    ShowResults --> ListUpdate[리스트 업데이트<br/>카드 그리드 표시]

    MapUpdate --> Interaction{사용자 상호작용}
    ListUpdate --> Interaction

    Interaction -->|카드 클릭| CardDetail[해당 관광지 상세페이지 이동]
    Interaction -->|마커 클릭| MarkerInfo[인포윈도우 표시<br/>상세보기 버튼]
    Interaction -->|필터 초기화| ResetFilters[모든 필터 초기화<br/>초기 상태로 복귀]
    Interaction -->|페이지네이션| Pagination[다음 페이지 로드<br/>pageNo 증가]

    MarkerInfo --> CardDetail
    ResetFilters --> InitLoad
    Pagination --> CombinedAPI

    EmptyState --> ResetFilters

    CardDetail --> End([상세페이지로 이동])

    style Start fill:#e1f5fe
    style SearchAPI fill:#e3f2fd
    style FilterAPI1 fill:#e3f2fd
    style FilterAPI2 fill:#e3f2fd
    style CombinedAPI fill:#e3f2fd
    style EmptyState fill:#ffebee
    style End fill:#c8e6c9
```

---

## 5. 상세페이지 플로우

```mermaid
flowchart TD
    Start(["상세페이지 접속<br/>/places/[contentId]"]) --> Load[페이지 로드]

    Load --> Parallel{"병렬 API 호출"}

    Parallel --> CommonAPI["detailCommon2 API<br/>기본 정보"]
    Parallel --> IntroAPI["detailIntro2 API<br/>운영 정보"]
    Parallel --> ImageAPI["detailImage2 API<br/>이미지 목록"]
    Parallel --> BookmarkCheck{"로그인 여부 확인"}

    BookmarkCheck -->|로그인| BookmarkQuery["Supabase 북마크 조회<br/>bookmarks 테이블 SELECT"]
    BookmarkCheck -->|비로그인| NoBookmark[북마크 버튼 비활성화]

    CommonAPI --> DisplayCommon[기본 정보 표시<br/>이름/주소/전화/홈페이지/개요]
    IntroAPI --> DisplayIntro[운영 정보 표시<br/>운영시간/요금/주차 등]
    ImageAPI --> DisplayGallery[이미지 갤러리 표시<br/>대표 이미지 + 서브 이미지]

    DisplayCommon --> Actions{사용자 액션}
    DisplayIntro --> Actions
    DisplayGallery --> Actions
    BookmarkQuery --> Actions
    NoBookmark --> Actions

    Actions -->|주소 복사| CopyAddress[클립보드 복사<br/>토스트 메시지]
    Actions -->|전화번호 클릭| CallPhone[tel: 링크로 전화 연결]
    Actions -->|홈페이지 클릭| OpenHomepage[새 창에서 홈페이지 열기]
    Actions -->|이미지 클릭| ImageModal[전체화면 이미지 모달<br/>슬라이드 기능]
    Actions -->|공유 버튼| ShareURL[URL 복사<br/>navigator.clipboard.writeText]
    Actions -->|북마크 버튼| BookmarkAction{북마크 상태}
    Actions -->|길찾기 버튼| Navigation[네이버 지도 길찾기<br/>좌표 기반 URL 생성]
    Actions -->|뒤로가기| Back[이전 페이지로 이동]

    BookmarkAction -->|북마크 없음 + 클릭| CheckAuth{인증 확인}
    BookmarkAction -->|북마크 있음 + 클릭| RemoveBookmark[Supabase 북마크 삭제<br/>DELETE from bookmarks]

    CheckAuth -->|로그인| AddBookmark[Supabase 북마크 추가<br/>INSERT into bookmarks]
    CheckAuth -->|비로그인| LoginDialog[로그인 유도 다이얼로그]

    LoginDialog --> LoginPage[로그인 페이지 이동]
    LoginPage --> LoginReturn[로그인 후 상세페이지 복귀]
    LoginReturn --> AddBookmark

    AddBookmark --> UpdateBookmarkUI[북마크 UI 업데이트<br/>별 아이콘 채움]
    RemoveBookmark --> UpdateBookmarkUI2[북마크 UI 업데이트<br/>별 아이콘 빈 상태]

    ShareURL --> ShareToast[복사 완료 토스트]
    CopyAddress --> ShareToast

    Navigation --> NavApp[네이버 지도 앱/웹 열기]

    ImageModal --> CloseModal[모달 닫기]

    ShareToast --> End([완료])
    CallPhone --> End
    OpenHomepage --> End
    CloseModal --> End
    NavApp --> End
    UpdateBookmarkUI --> End
    UpdateBookmarkUI2 --> End
    Back --> End

    style Start fill:#e1f5fe
    style CommonAPI fill:#e3f2fd
    style IntroAPI fill:#e3f2fd
    style ImageAPI fill:#e3f2fd
    style BookmarkQuery fill:#f3e5f5
    style AddBookmark fill:#f3e5f5
    style RemoveBookmark fill:#ffebee
    style LoginDialog fill:#fff3e0
    style End fill:#c8e6c9
```

---

## 6. 북마크 관리 플로우

```mermaid
flowchart TD
    Start(["북마크 목록 페이지 접속<br/>/bookmarks"]) --> AuthCheck{"인증 확인"}

    AuthCheck -->|비로그인| Redirect[로그인 페이지로 리다이렉트]
    AuthCheck -->|로그인| LoadBookmarks["Supabase 북마크 목록 조회<br/>SELECT * FROM bookmarks<br/>WHERE user_id = clerk_user_id"]

    Redirect --> Login[로그인 완료]
    Login --> LoadBookmarks

    LoadBookmarks --> EmptyCheck{북마크 여부}

    EmptyCheck -->|북마크 없음| EmptyState[빈 상태 표시<br/>북마크 추가 안내]
    EmptyCheck -->|북마크 있음| DisplayList[북마크 목록 표시<br/>카드 그리드 레이아웃]

    DisplayList --> UserActions{사용자 액션}

    UserActions -->|정렬 변경| SortChange{정렬 옵션}
    UserActions -->|카드 클릭| CardClick[관광지 상세페이지 이동]
    UserActions -->|개별 삭제| SingleDelete[개별 북마크 삭제 버튼 클릭]
    UserActions -->|일괄 삭제| BatchDelete[체크박스 선택<br/>일괄 삭제 버튼]

    SortChange -->|최신순| SortByDate[created_at DESC 정렬]
    SortChange -->|이름순| SortByName[관광지명 가나다순 정렬]
    SortChange -->|지역별| SortByArea[지역코드별 그룹화]

    SortByDate --> RefreshList[목록 새로고침]
    SortByName --> RefreshList
    SortByArea --> RefreshList

    SingleDelete --> ConfirmSingle{삭제 확인}
    ConfirmSingle -->|확인| DeleteSingle[Supabase DELETE<br/>WHERE id = bookmark_id]
    ConfirmSingle -->|취소| DisplayList

    BatchDelete --> SelectItems[여러 북마크 선택]
    SelectItems --> ConfirmBatch{일괄 삭제 확인}
    ConfirmBatch -->|확인| DeleteBatch[Supabase DELETE<br/>WHERE id IN selected_ids]
    ConfirmBatch -->|취소| DisplayList

    DeleteSingle --> UpdateUI[UI 업데이트<br/>해당 항목 제거]
    DeleteBatch --> UpdateUI

    UpdateUI --> RefreshList

    RefreshList --> LoadBookmarks

    CardClick --> DetailPage["상세페이지<br/>/places/[contentId]"]
    DetailPage --> ReturnActions{상세페이지 액션}

    ReturnActions -->|뒤로가기| DisplayList
    ReturnActions -->|북마크 삭제| RemoveFromDetail[상세페이지에서 북마크 삭제]
    RemoveFromDetail --> ReturnToBookmarks[북마크 목록으로 복귀]
    ReturnToBookmarks --> LoadBookmarks

    EmptyState --> AddBookmarkSuggestion[북마크 추가 안내<br/>홈페이지/상세페이지로 이동 제안]
    AddBookmarkSuggestion --> HomePage[홈페이지로 이동]
    HomePage --> EndFlow([종료])

    RefreshList --> EndFlow

    style Start fill:#e1f5fe
    style AuthCheck fill:#fff3e0
    style LoadBookmarks fill:#f3e5f5
    style DeleteSingle fill:#ffebee
    style DeleteBatch fill:#ffebee
    style EmptyState fill:#f5f5f5
    style EndFlow fill:#c8e6c9
```

---

## 7. 데이터베이스 연동 플로우 (Supabase)

```mermaid
flowchart TD
    Start([사용자 액션]) --> Action{액션 타입}

    Action -->|북마크 추가| AddFlow[북마크 추가 플로우]
    Action -->|북마크 삭제| DeleteFlow[북마크 삭제 플로우]
    Action -->|북마크 조회| QueryFlow[북마크 조회 플로우]

    AddFlow --> GetClerkId["현재 사용자 Clerk ID 조회<br/>useUser hook"]
    GetClerkId --> GetSupabaseUser["Supabase users 테이블 조회<br/>SELECT id FROM users<br/>WHERE clerk_id = clerk_user_id"]

    GetSupabaseUser --> UserExists{"사용자 존재 확인"}
    UserExists -->|존재함| AddBookmarkData["bookmarks 테이블 INSERT<br/>INSERT INTO bookmarks<br/>user_id, content_id"]
    UserExists -->|없음| SyncUser["사용자 동기화<br/>Clerk → Supabase<br/>INSERT INTO users"]
    SyncUser --> AddBookmarkData

    AddBookmarkData --> CheckDuplicate{"중복 확인<br/>UNIQUE 제약"}
    CheckDuplicate -->|중복 아님| InsertSuccess["INSERT 성공<br/>북마크 추가 완료"]
    CheckDuplicate -->|중복| DuplicateError["에러 처리<br/>이미 북마크된 항목"]

    InsertSuccess --> UpdateUI1[UI 업데이트]
    DuplicateError --> ErrorToast1[에러 토스트 표시]

    DeleteFlow --> GetClerkId2[Clerk ID 조회]
    GetClerkId2 --> GetSupabaseUser2["Supabase users 테이블 조회"]
    GetSupabaseUser2 --> DeleteBookmarkData["bookmarks 테이블 DELETE<br/>DELETE FROM bookmarks<br/>WHERE user_id = user_id<br/>AND content_id = content_id"]

    DeleteBookmarkData --> DeleteSuccess["DELETE 성공<br/>북마크 삭제 완료"]
    DeleteSuccess --> UpdateUI2[UI 업데이트]

    QueryFlow --> GetClerkId3[Clerk ID 조회]
    GetClerkId3 --> GetSupabaseUser3["Supabase users 테이블 조회"]
    GetSupabaseUser3 --> QueryBookmarks["bookmarks 테이블 SELECT<br/>SELECT * FROM bookmarks<br/>WHERE user_id = user_id<br/>ORDER BY created_at DESC"]

    QueryBookmarks --> JoinData["관광지 정보 조인<br/>bookmarks.content_id로<br/>한국관광공사 API 호출"]

    JoinData --> GetTourDetails["detailCommon2 API 호출<br/>각 content_id에 대해"]
    GetTourDetails --> MergeData[북마크 + 관광지 정보 병합]
    MergeData --> DisplayBookmarks[북마크 목록 표시]

    UpdateUI1 --> End([완료])
    UpdateUI2 --> End
    ErrorToast1 --> End
    DisplayBookmarks --> End

    style Start fill:#e1f5fe
    style AddBookmarkData fill:#e8f5e9
    style DeleteBookmarkData fill:#ffebee
    style QueryBookmarks fill:#e3f2fd
    style SyncUser fill:#fff3e0
    style DuplicateError fill:#ffebee
    style End fill:#c8e6c9
```

---

## 8. 에러 처리 및 예외 플로우

```mermaid
flowchart TD
    Start([API 호출 시도]) --> APIRequest{"API 요청"}

    APIRequest --> Success{"응답 확인"}

    Success -->|성공| ProcessData[데이터 처리 및 표시]
    Success -->|에러| ErrorType{에러 타입}

    ErrorType -->|네트워크 에러| NetworkError[네트워크 연결 실패]
    ErrorType -->|API 에러| APIError{"API 에러 코드"}
    ErrorType -->|인증 에러| AuthError["인증 실패<br/>API 키 오류"]
    ErrorType -->|데이터 없음| NoData[검색 결과 없음]

    NetworkError --> ShowNetworkMsg["오프라인 안내 메시지<br/>재시도 버튼 표시"]
    ShowNetworkMsg --> RetryNetwork{"재시도 선택"}
    RetryNetwork -->|재시도| APIRequest
    RetryNetwork -->|취소| EndError([에러 상태 유지])

    APIError -->|Rate Limit| RateLimit[API 호출 제한 초과<br/>잠시 후 재시도 안내]
    APIError -->|서버 에러| ServerError[서버 에러 안내<br/>잠시 후 재시도]
    APIError -->|잘못된 요청| BadRequest[잘못된 파라미터<br/>필터/검색어 확인 안내]

    RateLimit --> WaitRetry[대기 후 재시도]
    ServerError --> WaitRetry
    BadRequest --> FixParams[파라미터 수정 안내]

    WaitRetry --> APIRequest
    FixParams --> APIRequest

    AuthError --> CheckEnv[환경변수 확인<br/>API 키 검증]
    CheckEnv --> FixAuth[API 키 재설정 안내]
    FixAuth --> EndError

    NoData --> ShowEmpty[결과 없음 표시<br/>필터 초기화 제안]
    ShowEmpty --> ResetFilters{필터 초기화}
    ResetFilters -->|초기화| APIRequest
    ResetFilters -->|유지| EndEmpty([빈 상태 유지])

    ProcessData --> ValidateData{"데이터 유효성 확인"}

    ValidateData -->|유효함| DisplaySuccess[정상 표시]
    ValidateData -->|누락/오류| DataError{"데이터 오류 처리"}

    DataError -->|이미지 없음| DefaultImage[기본 이미지 표시]
    DataError -->|정보 누락| HideFields[누락된 필드 숨김 처리]
    DataError -->|좌표 오류| SkipMap[지도 표시 생략]

    DefaultImage --> DisplaySuccess
    HideFields --> DisplaySuccess
    SkipMap --> DisplaySuccess

    DisplaySuccess --> End([정상 완료])
    EndError --> End
    EndEmpty --> End

    style Start fill:#e1f5fe
    style NetworkError fill:#ffebee
    style APIError fill:#ffebee
    style AuthError fill:#ffebee
    style NoData fill:#fff3e0
    style DisplaySuccess fill:#c8e6c9
    style End fill:#c8e6c9
```

---

## 주요 엔드포인트 및 데이터 흐름 요약

### 페이지 라우트

- `/` - 홈페이지 (관광지 목록 + 필터 + 지도)
- `/places/[contentId]` - 상세페이지
- `/bookmarks` - 북마크 목록 (로그인 필요)

### 주요 API 호출

- **한국관광공사 API**:

  - `areaCode2` - 지역코드 조회
  - `areaBasedList2` - 지역 기반 관광정보 조회
  - `searchKeyword2` - 키워드 검색
  - `detailCommon2` - 상세 기본 정보
  - `detailIntro2` - 상세 운영 정보
  - `detailImage2` - 이미지 목록

- **Supabase**:
  - `bookmarks` 테이블 - 북마크 데이터 저장
  - `users` 테이블 - Clerk 사용자 동기화

### 데이터베이스 스키마 (tour_schema.sql)

- `users` 테이블: `id`, `clerk_id`, `name`, `created_at`
- `bookmarks` 테이블: `id`, `user_id`, `content_id`, `created_at`
  - UNIQUE 제약: `(user_id, content_id)`
  - 인덱스: `user_id`, `content_id`, `created_at`

---

## 플로우 다이어그램 사용 가이드

1. **전체 플로우 개요**: 프로젝트의 전체적인 사용자 여정을 파악
2. **비로그인 유저 플로우**: 인증 없이 사용 가능한 기능 중심
3. **로그인 유저 플로우**: 북마크 기능이 포함된 전체 플로우
4. **검색 및 필터 플로우**: 관광지 탐색 기능의 상세 흐름
5. **상세페이지 플로우**: 상세페이지의 모든 기능과 상호작용
6. **북마크 관리 플로우**: 북마크 목록 페이지의 기능
7. **데이터베이스 연동 플로우**: Supabase와의 데이터 동기화 과정
8. **에러 처리 플로우**: 예외 상황 및 에러 처리 방법

---

## 참고 사항

- **RLS 정책**: 개발 환경에서는 비활성화되어 있으며, 프로덕션 배포 전 반드시 활성화 필요
- **Clerk 인증**: 북마크 기능은 인증된 사용자만 사용 가능
- **좌표 변환**: KATEC 좌표계를 사용하므로 `mapx`, `mapy` 값을 `10000000`으로 나누어 변환
- **API Rate Limit**: 한국관광공사 API 호출 제한 확인 필요
- **네이버 지도**: 월 10,000,000건 무료 제한 확인 필요
