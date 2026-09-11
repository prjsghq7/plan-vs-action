PRAGMA foreign_keys = ON;

DELETE FROM task_status_events;
DELETE FROM actions;
DELETE FROM task_tags;
DELETE FROM reviews;
DELETE FROM plan_history;
DELETE FROM tasks;
DELETE FROM tags;
DELETE FROM plans;

INSERT OR IGNORE INTO workspaces (id, name, slug, created_at)
VALUES ('public', 'Plan vs Action 공개 공간', 'public', '2026-09-10T00:00:00.000Z');

INSERT INTO plans (
  id, workspace_id, title, priority,
  success_criteria, created_at, updated_at, deleted_at
) VALUES
  ('sample_plan_assignment', 'public', '[샘플] 과제 6 완성하기', 'high',
   '계획·실행·돌아보기 전체 흐름을 직접 확인한다.',
   '2026-09-08T09:00:00.000Z', '2026-09-10T09:00:00.000Z', NULL),
  ('sample_plan_empty', 'public', '[샘플] 새 계획 테스트', 'medium',
   '계획 상세에서 할 일을 추가하고 수정·삭제해 본다.',
   '2026-09-10T09:00:00.000Z', '2026-09-10T09:00:00.000Z', NULL),
  ('sample_plan_delete', 'public', '[샘플] 삭제 연습용 계획', 'low',
   '할 일과 계획의 소프트 삭제 동작을 확인한다.',
   '2026-09-10T09:05:00.000Z', '2026-09-10T09:05:00.000Z', NULL);

INSERT INTO tasks (
  id, plan_id, title, due_date, priority, estimated_minutes, status,
  status_version, completed_at, created_at, updated_at, deleted_at
) VALUES
  ('sample_task_done', 'sample_plan_assignment', '화면 구조 점검', '2026-09-09', 'high', 30, 'completed',
   1, '2026-09-09T11:35:00.000Z', '2026-09-08T09:10:00.000Z', '2026-09-09T11:35:00.000Z', NULL),
  ('sample_task_today', 'sample_plan_assignment', '계획 상세 수정 테스트', '2026-09-10', 'medium', 40, 'active',
   0, NULL, '2026-09-08T09:15:00.000Z', '2026-09-08T09:15:00.000Z', NULL),
  ('sample_task_overdue', 'sample_plan_assignment', 'DB 저장 확인', '2026-09-08', 'high', 20, 'active',
   0, NULL, '2026-09-08T09:20:00.000Z', '2026-09-08T09:20:00.000Z', NULL),
  ('sample_task_future', 'sample_plan_assignment', '최종 돌아보기 작성', '2026-09-15', 'low', 30, 'active',
   0, NULL, '2026-09-08T09:25:00.000Z', '2026-09-08T09:25:00.000Z', NULL),
  ('sample_task_many_01', 'sample_plan_assignment', '동일 날짜 일정 01 · 요구사항 다시 읽기', '2026-09-10', 'high', 10, 'active', 0, NULL, '2026-09-10T01:01:00.000Z', '2026-09-10T01:01:00.000Z', NULL),
  ('sample_task_many_02', 'sample_plan_assignment', '동일 날짜 일정 02 · 테이블 관계 확인', '2026-09-10', 'medium', 15, 'active', 0, NULL, '2026-09-10T01:02:00.000Z', '2026-09-10T01:02:00.000Z', NULL),
  ('sample_task_many_03', 'sample_plan_assignment', '동일 날짜 일정 03 · 계획 목록 확인', '2026-09-10', 'low', 10, 'completed', 1, '2026-09-10T02:03:00.000Z', '2026-09-10T01:03:00.000Z', '2026-09-10T02:03:00.000Z', NULL),
  ('sample_task_many_04', 'sample_plan_assignment', '동일 날짜 일정 04 · 계획 상세 확인', '2026-09-10', 'medium', 10, 'active', 0, NULL, '2026-09-10T01:04:00.000Z', '2026-09-10T01:04:00.000Z', NULL),
  ('sample_task_many_05', 'sample_plan_assignment', '동일 날짜 일정 05 · 할 일 추가 확인', '2026-09-10', 'high', 20, 'active', 0, NULL, '2026-09-10T01:05:00.000Z', '2026-09-10T01:05:00.000Z', NULL),
  ('sample_task_many_06', 'sample_plan_assignment', '동일 날짜 일정 06 · 할 일 수정 확인', '2026-09-10', 'medium', 20, 'active', 0, NULL, '2026-09-10T01:06:00.000Z', '2026-09-10T01:06:00.000Z', NULL),
  ('sample_task_many_07', 'sample_plan_assignment', '동일 날짜 일정 07 · 할 일 삭제 확인', '2026-09-10', 'low', 10, 'active', 0, NULL, '2026-09-10T01:07:00.000Z', '2026-09-10T01:07:00.000Z', NULL),
  ('sample_task_many_08', 'sample_plan_assignment', '동일 날짜 일정 08 · 실행 기록 확인', '2026-09-10', 'high', 25, 'completed', 1, '2026-09-10T02:08:00.000Z', '2026-09-10T01:08:00.000Z', '2026-09-10T02:08:00.000Z', NULL),
  ('sample_task_many_09', 'sample_plan_assignment', '동일 날짜 일정 09 · 완료 취소 확인', '2026-09-10', 'medium', 10, 'active', 0, NULL, '2026-09-10T01:09:00.000Z', '2026-09-10T01:09:00.000Z', NULL),
  ('sample_task_many_10', 'sample_plan_assignment', '동일 날짜 일정 10 · 필터 확인', '2026-09-10', 'low', 10, 'active', 0, NULL, '2026-09-10T01:10:00.000Z', '2026-09-10T01:10:00.000Z', NULL),
  ('sample_task_many_11', 'sample_plan_assignment', '동일 날짜 일정 11 · 검색 확인', '2026-09-10', 'high', 15, 'active', 0, NULL, '2026-09-10T01:11:00.000Z', '2026-09-10T01:11:00.000Z', NULL),
  ('sample_task_many_12', 'sample_plan_assignment', '동일 날짜 일정 12 · 스크롤 확인', '2026-09-10', 'medium', 15, 'active', 0, NULL, '2026-09-10T01:12:00.000Z', '2026-09-10T01:12:00.000Z', NULL),
  ('sample_task_many_13', 'sample_plan_assignment', '동일 날짜 일정 13 · 아주 긴 제목이 카드와 목록의 너비를 넘어가더라도 화면 전체에 가로 스크롤을 만들지 않는지 확인하기 위한 테스트 항목', '2026-09-10', 'low', 30, 'active', 0, NULL, '2026-09-10T01:13:00.000Z', '2026-09-10T01:13:00.000Z', NULL),
  ('sample_task_many_14', 'sample_plan_assignment', '동일 날짜 일정 14 · 태그 표시 확인', '2026-09-10', 'high', 10, 'active', 0, NULL, '2026-09-10T01:14:00.000Z', '2026-09-10T01:14:00.000Z', NULL),
  ('sample_task_many_15', 'sample_plan_assignment', '동일 날짜 일정 15 · 달력 +N 확인', '2026-09-10', 'medium', 10, 'completed', 1, '2026-09-10T02:15:00.000Z', '2026-09-10T01:15:00.000Z', '2026-09-10T02:15:00.000Z', NULL),
  ('sample_task_many_16', 'sample_plan_assignment', '동일 날짜 일정 16 · 마지막 항목 확인', '2026-09-10', 'low', 10, 'active', 0, NULL, '2026-09-10T01:16:00.000Z', '2026-09-10T01:16:00.000Z', NULL),
  ('sample_empty_task', 'sample_plan_empty', '새 계획의 첫 할 일 작성', '2026-09-11', 'medium', 30, 'active', 0, NULL, '2026-09-10T02:30:00.000Z', '2026-09-10T02:30:00.000Z', NULL),
  ('sample_delete_task_01', 'sample_plan_delete', '삭제 연습 01', '2026-09-12', 'low', 15, 'active', 0, NULL, '2026-09-10T03:01:00.000Z', '2026-09-10T03:01:00.000Z', NULL),
  ('sample_delete_task_02', 'sample_plan_delete', '삭제 연습 02', '2026-09-13', 'medium', 15, 'active', 0, NULL, '2026-09-10T03:02:00.000Z', '2026-09-10T03:02:00.000Z', NULL),
  ('sample_delete_task_03', 'sample_plan_delete', '삭제 연습 03', '2026-09-14', 'high', 15, 'active', 0, NULL, '2026-09-10T03:03:00.000Z', '2026-09-10T03:03:00.000Z', NULL);

INSERT INTO tags (id, workspace_id, name, normalized_name, search_key) VALUES
  ('sample_tag_assignment', 'public', '과제', '과제', '과제'),
  ('sample_tag_design', 'public', '디자인', '디자인', '디자인'),
  ('sample_tag_test', 'public', '테스트', '테스트', '테스트');

INSERT INTO task_tags (task_id, tag_id) VALUES
  ('sample_task_done', 'sample_tag_design'),
  ('sample_task_today', 'sample_tag_test'),
  ('sample_task_overdue', 'sample_tag_assignment'),
  ('sample_task_overdue', 'sample_tag_test'),
  ('sample_task_future', 'sample_tag_assignment'),
  ('sample_task_many_13', 'sample_tag_design'),
  ('sample_task_many_13', 'sample_tag_test'),
  ('sample_task_many_14', 'sample_tag_assignment'),
  ('sample_task_many_14', 'sample_tag_design'),
  ('sample_task_many_14', 'sample_tag_test');

INSERT INTO actions (
  id, task_id, started_at, ended_at, actual_minutes, note, created_at
) VALUES
  ('sample_action_done', 'sample_task_done', '2026-09-09T11:00:00.000Z', '2026-09-09T11:35:00.000Z', 35, '', '2026-09-09T11:35:00.000Z'),
  ('sample_action_progress', 'sample_task_today', '2026-09-10T09:00:00.000Z', '2026-09-10T09:25:00.000Z', 25, '레이아웃 간격을 다시 조정함', '2026-09-10T09:25:00.000Z');

INSERT INTO task_status_events (
  id, task_id, idempotency_key, from_status, to_status, version_before, created_at
) VALUES
  ('sample_event_done', 'sample_task_done', 'sample_task_done:0:completed', 'active', 'completed', 0, '2026-09-09T11:35:00.000Z'),
  ('sample_event_many_03', 'sample_task_many_03', 'sample_task_many_03:0:completed', 'active', 'completed', 0, '2026-09-10T02:03:00.000Z'),
  ('sample_event_many_08', 'sample_task_many_08', 'sample_task_many_08:0:completed', 'active', 'completed', 0, '2026-09-10T02:08:00.000Z'),
  ('sample_event_many_15', 'sample_task_many_15', 'sample_task_many_15:0:completed', 'active', 'completed', 0, '2026-09-10T02:15:00.000Z');

INSERT INTO reviews (
  id, workspace_id, plan_id, improvement_text, next_plan_id, created_at, updated_at
) VALUES
  ('sample_review_assignment', 'public', 'sample_plan_assignment',
   '계획 단계에서 할 일을 더 작게 나누고, 실제 시간은 실행 직후 기록한다.', NULL,
   '2026-09-10T10:00:00.000Z', '2026-09-10T10:00:00.000Z');
