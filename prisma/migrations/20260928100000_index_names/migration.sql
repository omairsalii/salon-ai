ALTER INDEX IF EXISTS "admin_audit_created_idx" RENAME TO "admin_audit_logs_created_at_idx";
ALTER INDEX IF EXISTS "auth_tokens_subject_idx" RENAME TO "auth_tokens_subject_id_purpose_idx";
ALTER INDEX IF EXISTS "reviews_tenant_idx" RENAME TO "reviews_tenant_id_created_at_idx";
