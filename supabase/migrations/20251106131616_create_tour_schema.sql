-- =====================================================
-- 마이그레이션: My Trip tour_schema 데이터베이스 스키마
-- 작성일: 2025-11-06
-- 설명: My Trip 프로젝트의 북마크 기능을 위한 데이터베이스 스키마
--       - bookmarks 테이블 생성 (관광지 즐겨찾기)
--       - RLS 비활성화 (개발 환경)
--       - PRD 2.4.5 북마크 기능 구현
-- 
-- 참고 문서:
--   - PRD.md: 프로젝트 요구사항 정의서
--   - docs/tour_schema.sql: 전체 스키마 설계 문서
--   - TODO.md: 개발 체크리스트
-- =====================================================

-- =====================================================
-- bookmarks 테이블 (북마크 기능)
-- =====================================================
-- 사용자가 관광지를 북마크할 수 있는 기능
-- 각 사용자는 동일한 관광지를 한 번만 북마크 가능 (UNIQUE 제약)

create table if not exists public.bookmarks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references public.users(id) on delete cascade,
    content_id text not null,  -- 한국관광공사 API의 contentid
    created_at timestamp with time zone default now() not null,

    -- 동일 사용자가 같은 관광지를 중복 북마크하는 것을 방지
    constraint unique_user_bookmark unique(user_id, content_id)
);

-- 테이블 소유자 설정
alter table public.bookmarks owner to postgres;

-- 인덱스 생성 (성능 최적화)
create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);
create index if not exists idx_bookmarks_content_id on public.bookmarks(content_id);
create index if not exists idx_bookmarks_created_at on public.bookmarks(created_at desc);

-- Row Level Security (RLS) 비활성화
-- 개발 환경에서는 RLS를 비활성화하여 권한 에러 방지
-- 프로덕션 배포 전에는 적절한 RLS 정책을 검토하고 적용 필요
alter table public.bookmarks disable row level security;

-- 권한 부여
grant all on table public.bookmarks to anon;
grant all on table public.bookmarks to authenticated;
grant all on table public.bookmarks to service_role;

-- 테이블 설명
comment on table public.bookmarks is '사용자 북마크 정보 - 관광지 즐겨찾기';
comment on column public.bookmarks.user_id is 'users 테이블의 사용자 ID';
comment on column public.bookmarks.content_id is '한국관광공사 API contentid (예: 125266)';
comment on column public.bookmarks.created_at is '북마크 생성 시간';

