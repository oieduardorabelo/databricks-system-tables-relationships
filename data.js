// Databricks system tables: key columns, primary keys and relationships.
//
// This file is written by hand. columns.js is generated (scripts/build-columns.py)
// and holds every real column of the tables that a workspace export found.
//
// cols: the KEY columns. A table box shows these first; "+ N more" expands it to
//   every column in columns.js. Lines (ERD_RELS) always use key columns.
//   Format "name type" or just "name" (the type then comes from columns.js).
//   - A leading "!" marks a primary key column (underlined in the diagram).
//   - A dotted name (for example "usage_metadata.job_id") is a field inside a struct.
// A table that is not in columns.js (it was not enabled in the exported
//   workspace) uses cols as its full column list, from the Databricks docs.
// Any table in columns.js that is not listed here is added automatically.
//
// x / y are start positions for the image layout. Tables without x / y are
// placed automatically, grouped by schema, to the right of the main diagram.

window.ERD_TABLES = [
  // ---------- system.access ----------
  { id: "system.access.table_lineage", x: 640, y: 0, cols: [
    "account_id string", "metastore_id string", "workspace_id string",
    "entity_type string", "entity_id string", "entity_run_id string",
  ]},
  { id: "system.access.column_lineage", x: 640, y: 180, cols: [
    "account_id string", "metastore_id string", "workspace_id string",
    "entity_type string", "entity_id string", "entity_run_id string",
  ]},
  { id: "system.access.workspaces_latest", x: 1110, y: 135, cols: [
    "!account_id string", "!workspace_id string", "!workspace_name string",
    "!workspace_url string", "!create_time timestamp",
  ]},
  { id: "system.access.outbound_network", x: 1870, y: 45, cols: [
    "!event_id string", "account_id string", "workspace_id string",
  ]},
  { id: "system.access.assistant_events", x: 1870, y: 155, cols: [
    "!event_id string", "!account_id string", "!workspace_id string",
  ]},
  { id: "system.access.clean_room_events", x: 1870, y: 265, cols: [
    "!metastore_id string", "!account_id string", "!event_id string", "!clean_room_name string",
  ]},
  { id: "system.access.audit", x: 1870, y: 395, cols: [
    "account_id string", "workspace_id string", "version string", "!event_id string",
    "event_date date", "event_time timestamp", "source_ip_address string",
    "user_identity struct<email: string, subjectName: string>",
    "identity_metadata struct<run_by: string, run_as: string>",
    "user_agent string", "session_id string", "service_name string", "action_name string",
    "request_id string", "request_params map<string, string>",
    "response struct<statusCode:int, errorMessage:string, result:string>",
    "audit_level string",
  ]},

  // ---------- system.billing ----------
  { id: "system.billing.list_prices", x: 1545, y: 360, cols: [
    "!account_id string", "!cloud string", "!sku_name string", "!price_start_time timestamp",
  ]},
  { id: "system.billing.usage", x: 1545, y: 520, cols: [
    "account_id string", "workspace_id string", "sku_name string",
    "cloud string", "usage_metadata struct",
    "!record_id", "usage_date", "usage_quantity", "billing_origin_product",
    "usage_metadata.job_id string", "usage_metadata.job_run_id string",
    "usage_metadata.notebook_id string", "usage_metadata.warehouse_id string",
    "usage_metadata.node_type string", "usage_metadata.cluster_id string",
    "usage_metadata.endpoint_id string", "usage_metadata.dlt_pipeline_id string",
    "usage_metadata.dlt_update_id string", "usage_metadata.dlt_maintenance_id string",
    "usage_metadata.instance_pool_id", "usage_metadata.sharing_materialization_id",
    "usage_metadata.failover_group_name",
  ]},

  // ---------- system.lakeflow ----------
  { id: "system.lakeflow.jobs", x: 310, y: 450, cols: [
    "account_id string", "workspace_id string", "job_id string", "change_time timestamp",
  ]},
  { id: "system.lakeflow.job_tasks", x: 310, y: 580, cols: [
    "account_id string", "workspace_id string", "job_id string", "task_key string",
    "depends_on_keys array<string>", "change_time timestamp",
  ]},
  { id: "system.lakeflow.job_run_timeline", x: 310, y: 760, cols: [
    "account_id string", "workspace_id string", "job_id string", "run_id string",
    "period_end_time timestamp",
  ]},
  { id: "system.lakeflow.job_task_run_timeline", x: 310, y: 910, cols: [
    "account_id string", "workspace_id string", "job_id string", "run_id string",
    "job_run_id string", "period_end_time timestamp", "task_key string",
    "compute_ids array<string>",
  ]},

  // ---------- system.compute ----------
  { id: "system.compute.warehouses", x: 985, y: 430, cols: [
    "account_id string", "workspace_id string", "warehouse_id string", "warehouse_name string",
    "warehouse_type string", "warehouse_size string", "change_time timestamp", "delete_time timestamp",
  ]},
  { id: "system.compute.warehouse_events", x: 985, y: 670, cols: [
    "account_id string", "workspace_id string", "warehouse_id string", "event_type string",
    "cluster_count integer", "event_time timestamp",
  ]},
  { id: "system.compute.node_types", x: 985, y: 860, cols: [
    "!account_id string", "!node_type string",
  ]},
  { id: "system.compute.clusters", x: 985, y: 990, cols: [
    "!workspace_id string", "!cluster_id string", "!change_time timestamp", "cluster_name",
    "driver_node_type", "worker_node_type", "driver_instance_pool_id", "worker_instance_pool_id",
  ]},
  { id: "system.compute.node_timeline", x: 985, y: 1120, cols: [
    "!workspace_id string", "!cluster_id string", "!instance_id string",
    "!start_time timestamp", "!node_type string",
  ]},

  // ---------- system.query ----------
  { id: "system.query.history", x: 985, y: 1300, cols: [
    "account_id string", "workspace_id string", "statement_id string", "compute struct", "compute.cluster_id",
    "compute.warehouse_id string", "executed_by_user_id string", "query_source struct",
    "query_source.job_info struct", "query_source.job_info.job_id", "query_source.job_info.job_run_id",
    "query_source.job_info.job_task_run_id string", "query_source.alert_id",
    "query_source.pipeline_info.pipeline_id", "query_source.pipeline_info.update_id",
    "executed_as_user_id string",
  ]},

  // ---------- system.serving ----------
  { id: "system.serving.endpoint_usage", x: 1545, y: 920, cols: [
    "!account_id string", "!workspace_id string", "!databricks_request_id string",
    "served_entity_id string",
  ]},
  { id: "system.serving.served_entities", x: 1545, y: 1075, cols: [
    "!workspace_id string", "!served_entity_id string", "!change_time timestamp",
    "endpoint_id string",
  ]},

  // ---------- system.mlflow ----------
  { id: "system.mlflow.experiments_latest", x: 1880, y: 890, cols: [
    "account_id string", "update_time timestamp", "delete_time timestamp",
    "!experiment_id string", "workspace_id string", "name string", "create_time timestamp",
  ]},
  { id: "system.mlflow.runs_latest", x: 1880, y: 1075, cols: [
    "account_id string", "update_time timestamp", "delete_time timestamp",
    "workspace_id string", "!run_id string", "experiment_id string", "created_by string",
    "start_time timestamp", "end_time timestamp", "run_name string", "status string",
    "params map<string, string>", "tags map<string, string>",
    "aggregated_metrics list<struct<metric_name:string, min_value:double, max_value:double, latest_value:double>>",
  ]},
  { id: "system.mlflow.run_metrics_history", x: 1880, y: 1440, cols: [
    "account_id string", "insert_time timestamp", "!record_id string", "workspace_id string",
    "run_id string", "experiment_id string", "metric_name string", "metric_time timestamp",
    "metric_step bigint", "metric_value double",
  ]},

  // ---------- system.marketplace ----------
  { id: "system.marketplace.listing_funnel_events", x: 0, y: 1160, cols: [
    "account_id string", "metastore_id string", "metastore_cloud string", "metastore_region string",
    "provider_id string", "provider_name string", "listing_id string", "listing_name string",
    "consumer_cloud string", "consumer_region string", "event_type string",
    "event_time timestamp", "event_date date",
  ]},
  { id: "system.marketplace.listing_access_events", x: 330, y: 1160, cols: [
    "account_id string", "metastore_id string", "metastore_cloud string", "metastore_region string",
    "provider_id string", "provider_name string", "listing_id string", "listing_name string",
    "consumer_delta_sharing_recipient_type string", "consumer_delta_sharing_recipient_name string",
    "consumer_cloud string", "consumer_region string", "consumer_metastore_id string",
    "consumer_email string", "consumer_name string", "consumer_company string",
    "consumer_intended_use string", "consumer_comment string", "event_type string",
    "event_time timestamp", "event_date date",
  ]},

  // ---------- Tables added from the full system catalog (positions are automatic) ----------
  { id: "system.access.inbound_network", cols: ["!event_id", "account_id", "workspace_id", "event_time", "policy_outcome"] },
  { id: "system.ai_gateway.usage", cols: ["account_id", "workspace_id", "!request_id", "invocation_id", "endpoint_id", "endpoint_name", "event_time", "total_tokens"] },
  { id: "system.ai_gateway.external_model_spend", cols: ["!record_id", "account_id", "workspace_id", "usage_date", "usage_metadata", "usage_metadata.endpoint_id", "usage_quantity"] },
  { id: "system.alert.alerts", cols: ["account_id", "workspace_id", "!alert_id", "display_name", "compute", "compute.cluster_id", "compute.warehouse_id", "change_time", "delete_time"] },
  { id: "system.alert.alert_evaluation_history", cols: ["account_id", "workspace_id", "alert_id", "job_id", "task_key", "!alert_run_id", "evaluated_state", "start_time"] },
  { id: "system.billing.account_prices", cols: ["!account_id", "!sku_name", "!cloud", "!price_start_time", "price_end_time", "currency_code", "pricing"] },
  { id: "system.billing.attributed_usage", cols: ["!record_id", "account_id", "workspace_id", "sku_name", "usage_metadata", "usage_metadata.dbsql_statement_id", "usage_metadata.warehouse_id", "usage_record_ids", "usage_date", "active_usage_quantity"] },
  { id: "system.compute.instance_events", cols: ["account_id", "workspace_id", "instance_id", "event_time", "instance_pool_id", "cluster_id", "node_type", "state"] },
  { id: "system.compute.instance_pools", cols: ["account_id", "!workspace_id", "!instance_pool_id", "!change_time", "instance_pool_name", "node_type", "delete_time"] },
  { id: "system.lakeflow.pipelines", cols: ["account_id", "!workspace_id", "!pipeline_id", "pipeline_type", "name", "change_time", "delete_time"] },
  { id: "system.lakeflow.pipeline_update_timeline", cols: ["account_id", "!workspace_id", "!pipeline_id", "!update_id", "update_type", "trigger_details", "trigger_details.job_task", "trigger_details.job_task.job_id", "result_state", "period_end_time"] },
  { id: "system.lakeflow.zerobus_stream", cols: ["account_id", "workspace_id", "!stream_id", "table_id", "table_name", "event_time"] },
  { id: "system.lakeflow.zerobus_ingest", cols: ["account_id", "workspace_id", "!stream_id", "!commit_version", "table_id", "table_name", "commit_time"] },
  { id: "system.lakeflow_pipeline_events_preview.pipeline_events", cols: ["!account_id", "workspace_id", "pipeline_id", "update_id", "!pipeline_event_id", "event_type", "event_time"] },
  { id: "system.sharing.materialization_history", cols: ["!sharing_materialization_id", "account_id", "workspace_id", "share_name", "schema_name", "table_name", "created_at"] },
  { id: "system.storage.predictive_optimization_operations_history", cols: ["account_id", "workspace_id", "catalog_name", "schema_name", "table_name", "table_id", "!operation_id", "operation_type", "usage_quantity"] },
  { id: "system.storage.auto_upgrade_operations_history", cols: ["account_id", "catalog_name", "schema_name", "table_name", "table_id", "!operation_id", "feature_name", "operation_result"] },
  { id: "system.storage.table_metrics_history", cols: ["snapshot_date", "account_id", "table_id", "catalog_name", "schema_name", "table_name", "total_bytes"] },
  { id: "system.tags.governed_tags", cols: ["!account_id", "!id", "tag_key", "deleted_at", "change_time"] },

  // ---------- Tables from the Databricks docs only (not enabled in the exported workspace) ----------
  { id: "system.data_classification.results", cols: [
    "latest_detected_time timestamp", "first_detected_time timestamp", "catalog_id string", "table_id string",
    "catalog_name string", "schema_name string", "table_name string", "column_name string", "data_type string",
    "class_tag string", "samples array<string>", "confidence string", "frequency float",
  ]},
  { id: "system.data_quality_monitoring.table_results", cols: [
    "event_time timestamp", "catalog_name string", "schema_name string", "table_name string", "catalog_id string",
    "schema_id string", "table_id string", "status string", "freshness struct", "freshness.status string",
    "freshness.commit_freshness struct", "completeness struct", "completeness.status string",
    "completeness.total_row_count struct", "completeness.daily_row_count struct",
  ]},
  { id: "system.replication.states", cols: [
    "!event_id string", "event_time timestamp", "account_id string", "failover_group_name string",
    "replication_state string", "errors array<struct>", "replication_lag_ms long", "effective_primary_region string",
    "managed_assets struct", "managed_assets.metastore_ids array", "managed_assets.workspace_sets array", "managed_assets.catalogs array",
  ]},
  // Lakebase: the docs list many more columns for each table. These are the shared IDs and main columns.
  ...[
    ["active_session_history", ["pid long", "queryid long", "plan_fingerprint long", "wait_event string", "backend_state long"]],
    ["wait_event_counters", ["wait_event_id long", "wait_class_name string", "wait_event_name string", "wait_event_count long"]],
    ["plan_history", ["queryid long", "plan_fingerprint long", "query_hash string", "duration_ms double", "query_text string"]],
    ["pg_stat_statements_counters", ["queryid long", "dbid long", "query string", "calls long", "total_exec_time double"]],
    ["ddl_history", ["command_tag string", "object_type string", "object_name string", "dbid long", "query_text string"]],
    ["database_counters", ["datid long", "datname string", "xact_commit long", "xact_rollback long"]],
    ["database_gauges", ["datid long", "datname string", "numbackends long", "size long"]],
    ["compute_counters", ["host_cpu_seconds double", "lfc_hits long", "lfc_misses long"]],
    ["compute_gauges", ["max_connections long", "total_size long", "replication_lag_bytes long"]],
    ["postgres_logs", ["severity string", "sqlstate string", "message string", "datname string"]],
  ].map(([name, extra]) => ({
    id: "system.lakebase." + name, partial: true,
    cols: ["project_id string", "branch_id string", "endpoint_id string", "compute_id string", "ts timestamp", "compute_mode string", ...extra],
  })),
]


// Relationships: [parentTable, parentColumn, childTable, childColumn, parentCard, childCard, source]
// Cardinality symbols (crow's foot notation):
//   one   = exactly one        (bar)
//   many  = many               (crow's foot)
//   zmany = zero or many       (circle + crow's foot)
//   omany = one or many        (bar + crow's foot)
// source: the Databricks docs page that documents the join. Without a source, the
//   line comes from matching column names, and the side panel says so.
const DOCS = "https://docs.databricks.com/aws/en";
const ERD = DOCS + "/admin/system-tables/#system-tables-relationships"; // the docs diagram
const SRC = {
  alerts: DOCS + "/admin/system-tables/alerts",
  pipelines: DOCS + "/admin/system-tables/jobs#pipelines",
  pipelineEvents: DOCS + "/admin/system-tables/pipeline-events",
  zerobus: DOCS + "/admin/system-tables/zerobus-ingest",
  materialization: DOCS + "/admin/system-tables/materialization",
  lakebase: DOCS + "/oltp/projects/observability-telemetry-reference",
};
const WS = "system.access.workspaces_latest";
window.ERD_RELS = [
  // Workspace dimension
  [WS, "workspace_id", "system.access.table_lineage", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.lakeflow.jobs", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.lakeflow.job_tasks", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.lakeflow.job_run_timeline", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.lakeflow.job_task_run_timeline", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.compute.warehouses", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.compute.warehouse_events", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.compute.clusters", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.compute.node_timeline", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.query.history", "workspace_id", "one", "zmany", ERD],
  [WS, "workspace_id", "system.billing.usage", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.serving.endpoint_usage", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.serving.served_entities", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.access.outbound_network", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.access.assistant_events", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.access.audit", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.mlflow.experiments_latest", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.mlflow.runs_latest", "workspace_id", "one", "many", ERD],
  [WS, "workspace_id", "system.mlflow.run_metrics_history", "workspace_id", "one", "many", ERD],

  // Lineage
  ["system.access.table_lineage", "entity_type", "system.access.column_lineage", "entity_type", "one", "zmany", ERD],
  ["system.access.table_lineage", "entity_id", "system.access.column_lineage", "entity_id", "one", "zmany", ERD],
  ["system.access.table_lineage", "entity_run_id", "system.access.column_lineage", "entity_run_id", "one", "zmany", ERD],
  ["system.lakeflow.jobs", "job_id", "system.access.table_lineage", "entity_id", "one", "zmany", ERD],
  ["system.lakeflow.job_run_timeline", "run_id", "system.access.table_lineage", "entity_run_id", "one", "zmany", ERD],

  // Lakeflow jobs
  ["system.lakeflow.jobs", "job_id", "system.lakeflow.job_tasks", "job_id", "one", "zmany", ERD],
  ["system.lakeflow.jobs", "job_id", "system.lakeflow.job_run_timeline", "job_id", "one", "zmany", ERD],
  ["system.lakeflow.jobs", "job_id", "system.lakeflow.job_task_run_timeline", "job_id", "one", "many", ERD],
  ["system.lakeflow.jobs", "job_id", "system.billing.usage", "usage_metadata.job_id", "one", "zmany", ERD],
  ["system.lakeflow.job_tasks", "task_key", "system.lakeflow.job_tasks", "depends_on_keys", "one", "many", ERD],
  ["system.lakeflow.job_tasks", "task_key", "system.lakeflow.job_task_run_timeline", "task_key", "one", "many", ERD],
  ["system.lakeflow.job_run_timeline", "run_id", "system.lakeflow.job_task_run_timeline", "job_run_id", "one", "many", ERD],
  ["system.lakeflow.job_run_timeline", "run_id", "system.billing.usage", "usage_metadata.job_run_id", "one", "zmany", ERD],
  ["system.lakeflow.job_task_run_timeline", "run_id", "system.query.history", "query_source.job_info.job_task_run_id", "one", "many", ERD],

  // Compute
  ["system.compute.warehouses", "warehouse_id", "system.compute.warehouse_events", "warehouse_id", "one", "zmany", ERD],
  ["system.compute.warehouses", "warehouse_id", "system.query.history", "compute.warehouse_id", "one", "many", ERD],
  ["system.compute.warehouses", "warehouse_id", "system.billing.usage", "usage_metadata.warehouse_id", "one", "many", ERD],
  ["system.compute.warehouses", "warehouse_id", "system.lakeflow.job_task_run_timeline", "compute_ids", "one", "zmany", ERD],
  ["system.compute.clusters", "cluster_id", "system.compute.node_timeline", "cluster_id", "one", "zmany", ERD],
  ["system.compute.clusters", "cluster_id", "system.billing.usage", "usage_metadata.cluster_id", "one", "zmany", ERD],
  ["system.compute.clusters", "cluster_id", "system.lakeflow.job_task_run_timeline", "compute_ids", "one", "zmany", ERD],
  ["system.compute.node_types", "node_type", "system.compute.node_timeline", "node_type", "one", "zmany", ERD],
  ["system.compute.node_types", "node_type", "system.billing.usage", "usage_metadata.node_type", "one", "zmany", ERD],
  ["system.compute.node_types", "node_type", "system.compute.clusters", "driver_node_type", "one", "zmany", ERD],
  ["system.compute.node_types", "node_type", "system.compute.clusters", "worker_node_type", "one", "zmany", ERD],

  // Billing
  ["system.billing.list_prices", "sku_name", "system.billing.usage", "sku_name", "one", "many", ERD],

  // Serving
  ["system.serving.served_entities", "served_entity_id", "system.serving.endpoint_usage", "served_entity_id", "one", "many", ERD],
  ["system.serving.served_entities", "endpoint_id", "system.billing.usage", "usage_metadata.endpoint_id", "one", "many", ERD],

  // MLflow
  ["system.mlflow.experiments_latest", "experiment_id", "system.mlflow.runs_latest", "experiment_id", "one", "many", ERD],
  ["system.mlflow.experiments_latest", "experiment_id", "system.mlflow.run_metrics_history", "experiment_id", "one", "many", ERD],
  ["system.mlflow.runs_latest", "run_id", "system.mlflow.run_metrics_history", "run_id", "one", "many", ERD],

  // Marketplace
  ["system.marketplace.listing_access_events", "provider_id", "system.marketplace.listing_funnel_events", "provider_id", "one", "omany", ERD],
  ["system.marketplace.listing_access_events", "listing_id", "system.marketplace.listing_funnel_events", "listing_id", "one", "omany", ERD],

  // ---------- Lines for the full system catalog ----------
  // Workspace dimension
  ...[
    "system.access.inbound_network", "system.ai_gateway.usage", "system.ai_gateway.external_model_spend",
    "system.alert.alerts", "system.alert.alert_evaluation_history", "system.billing.attributed_usage",
    "system.compute.instance_events", "system.compute.instance_pools", "system.lakeflow.pipelines",
    "system.lakeflow.pipeline_update_timeline", "system.lakeflow.zerobus_stream", "system.lakeflow.zerobus_ingest",
    "system.lakeflow_pipeline_events_preview.pipeline_events", "system.sharing.materialization_history",
    "system.storage.predictive_optimization_operations_history",
  ].map((t) => [WS, "workspace_id", t, "workspace_id", "one", "many"]),

  // Compute
  ["system.compute.node_types", "node_type", "system.compute.instance_events", "node_type", "one", "zmany"],
  ["system.compute.node_types", "node_type", "system.compute.instance_pools", "node_type", "one", "zmany"],
  ["system.compute.instance_pools", "instance_pool_id", "system.compute.instance_events", "instance_pool_id", "one", "zmany"],
  ["system.compute.instance_pools", "instance_pool_id", "system.compute.clusters", "driver_instance_pool_id", "one", "zmany"],
  ["system.compute.instance_pools", "instance_pool_id", "system.compute.clusters", "worker_instance_pool_id", "one", "zmany"],
  ["system.compute.instance_pools", "instance_pool_id", "system.billing.usage", "usage_metadata.instance_pool_id", "one", "zmany"],
  ["system.compute.clusters", "cluster_id", "system.compute.instance_events", "cluster_id", "one", "zmany"],
  ["system.compute.clusters", "cluster_id", "system.query.history", "compute.cluster_id", "one", "zmany"],
  ["system.compute.clusters", "cluster_id", "system.alert.alerts", "compute.cluster_id", "one", "zmany"],
  ["system.compute.warehouses", "warehouse_id", "system.alert.alerts", "compute.warehouse_id", "one", "zmany"],
  ["system.compute.warehouses", "warehouse_id", "system.billing.attributed_usage", "usage_metadata.warehouse_id", "one", "many"],

  // Alerts
  ["system.alert.alerts", "alert_id", "system.alert.alert_evaluation_history", "alert_id", "one", "zmany", SRC.alerts],
  ["system.alert.alerts", "alert_id", "system.query.history", "query_source.alert_id", "one", "zmany"],
  ["system.lakeflow.jobs", "job_id", "system.alert.alert_evaluation_history", "job_id", "one", "zmany", SRC.alerts],
  ["system.lakeflow.job_tasks", "task_key", "system.alert.alert_evaluation_history", "task_key", "one", "zmany", SRC.alerts],

  // Jobs and pipelines in query history
  ["system.lakeflow.jobs", "job_id", "system.query.history", "query_source.job_info.job_id", "one", "zmany"],
  ["system.lakeflow.job_run_timeline", "run_id", "system.query.history", "query_source.job_info.job_run_id", "one", "zmany"],
  ["system.lakeflow.jobs", "job_id", "system.lakeflow.pipeline_update_timeline", "trigger_details.job_task.job_id", "one", "zmany"],

  // Pipelines
  ["system.lakeflow.pipelines", "pipeline_id", "system.lakeflow.pipeline_update_timeline", "pipeline_id", "one", "zmany", SRC.pipelines],
  ["system.lakeflow.pipelines", "pipeline_id", "system.lakeflow_pipeline_events_preview.pipeline_events", "pipeline_id", "one", "many", SRC.pipelineEvents],
  ["system.lakeflow.pipelines", "pipeline_id", "system.billing.usage", "usage_metadata.dlt_pipeline_id", "one", "zmany", SRC.pipelines],
  ["system.lakeflow.pipelines", "pipeline_id", "system.query.history", "query_source.pipeline_info.pipeline_id", "one", "zmany"],
  ["system.lakeflow.pipeline_update_timeline", "update_id", "system.lakeflow_pipeline_events_preview.pipeline_events", "update_id", "one", "many", SRC.pipelineEvents],
  ["system.lakeflow.pipeline_update_timeline", "update_id", "system.billing.usage", "usage_metadata.dlt_update_id", "one", "zmany"],
  ["system.lakeflow.pipeline_update_timeline", "update_id", "system.query.history", "query_source.pipeline_info.update_id", "one", "zmany"],
  ["system.lakeflow.zerobus_stream", "stream_id", "system.lakeflow.zerobus_ingest", "stream_id", "one", "many", SRC.zerobus],

  // Billing
  ["system.billing.account_prices", "sku_name", "system.billing.usage", "sku_name", "one", "many"],
  ["system.billing.list_prices", "sku_name", "system.billing.attributed_usage", "sku_name", "one", "many"],
  ["system.billing.usage", "record_id", "system.billing.attributed_usage", "usage_record_ids", "one", "zmany"],
  ["system.query.history", "statement_id", "system.billing.attributed_usage", "usage_metadata.dbsql_statement_id", "one", "zmany"],
  ["system.sharing.materialization_history", "sharing_materialization_id", "system.billing.usage", "usage_metadata.sharing_materialization_id", "one", "zmany", SRC.materialization],
  ["system.replication.states", "failover_group_name", "system.billing.usage", "usage_metadata.failover_group_name", "one", "zmany"],

  // Lakebase telemetry
  ["system.lakebase.plan_history", "queryid", "system.lakebase.pg_stat_statements_counters", "queryid", "many", "many", SRC.lakebase],
  ["system.lakebase.plan_history", "queryid", "system.lakebase.active_session_history", "queryid", "many", "many", SRC.lakebase],
  ["system.lakebase.plan_history", "plan_fingerprint", "system.lakebase.active_session_history", "plan_fingerprint", "many", "many", SRC.lakebase],
];

// Scope, from the Databricks docs. Global: data from all regions of the account.
// Regional: data only from workspaces in the region of the metastore that you query from.
// Tables that are not listed have no scope in the docs.
window.ERD_SCOPE = Object.fromEntries([
  ...["billing.usage", "billing.list_prices", "access.workspaces_latest", "ai_gateway.usage",
      "replication.states", "tags.governed_tags"].map((t) => ["system." + t, "global"]),
  ...["access.audit", "access.assistant_events", "access.clean_room_events", "access.column_lineage",
      "access.inbound_network", "access.outbound_network", "access.table_lineage",
      "ai_gateway.external_model_spend", "alert.alerts", "alert.alert_evaluation_history",
      "compute.clusters", "compute.instance_events", "compute.instance_pools", "compute.node_timeline",
      "compute.node_types", "compute.warehouse_events", "compute.warehouses",
      "data_classification.results", "data_quality_monitoring.table_results",
      "lakeflow.jobs", "lakeflow.job_tasks", "lakeflow.job_run_timeline", "lakeflow.job_task_run_timeline",
      "lakeflow.pipelines", "lakeflow.pipeline_update_timeline", "lakeflow.zerobus_stream", "lakeflow.zerobus_ingest",
      "lakeflow_pipeline_events_preview.pipeline_events", "marketplace.listing_funnel_events",
      "marketplace.listing_access_events", "mlflow.experiments_latest", "mlflow.runs_latest",
      "mlflow.run_metrics_history", "query.history", "serving.served_entities", "serving.endpoint_usage",
      "sharing.materialization_history", "storage.auto_upgrade_operations_history",
      "storage.predictive_optimization_operations_history",
      ...["active_session_history", "wait_event_counters", "plan_history", "pg_stat_statements_counters",
          "ddl_history", "database_counters", "database_gauges", "compute_counters", "compute_gauges",
          "postgres_logs"].map((t) => "lakebase." + t),
  ].map((t) => ["system." + t, "regional"]),
]);

// Release status, from the Databricks docs. Tables that are not listed are generally available (GA).
// "unlisted": the table exists in Unity Catalog, but the docs do not list it.
window.ERD_STATUS = Object.fromEntries([
  ...["access.audit", "access.assistant_events", "access.clean_room_events", "access.inbound_network",
      "access.outbound_network", "access.workspaces_latest", "ai_gateway.usage", "compute.instance_events",
      "compute.instance_pools", "data_classification.results", "marketplace.listing_funnel_events",
      "marketplace.listing_access_events", "mlflow.experiments_latest", "mlflow.runs_latest",
      "mlflow.run_metrics_history", "serving.served_entities", "serving.endpoint_usage",
      "sharing.materialization_history", "storage.auto_upgrade_operations_history",
      "storage.predictive_optimization_operations_history"].map((t) => ["system." + t, "preview"]),
  ...["ai_gateway.external_model_spend", "lakeflow.zerobus_stream", "lakeflow.zerobus_ingest",
      "lakeflow_pipeline_events_preview.pipeline_events", "tags.governed_tags",
      ...["active_session_history", "wait_event_counters", "plan_history", "pg_stat_statements_counters",
          "ddl_history", "database_counters", "database_gauges", "compute_counters", "compute_gauges",
          "postgres_logs"].map((t) => "lakebase." + t)].map((t) => ["system." + t, "beta"]),
  ...["billing.account_prices", "billing.attributed_usage", "storage.table_metrics_history"].map((t) => ["system." + t, "unlisted"]),
]);

window.ERD_KEY_JOINS = [
  ["system.billing.usage", "usage_metadata.warehouse_id", "system.compute.warehouses", "warehouse_id"],
  ["system.billing.usage", "workspace_id", "system.access.workspaces_latest", "workspace_id"],
  ["system.compute.warehouse_events", "warehouse_id", "system.compute.warehouses", "warehouse_id"],
  ["system.query.history", "compute.warehouse_id", "system.compute.warehouses", "warehouse_id"],
];

// Known differences from the Databricks docs. scripts/check-docs.mjs does not report these.
window.ERD_DOCS = {
  // The diagram image in the docs overview page. If the file name changes, the docs diagram
  // changed: review the lines that use ERD.
  diagram: "system-tables-erd-690b80220d077015a023f90d59ff7560.svg",
  // Docs name -> real name in Unity Catalog.
  renamed: {
    "system.storage.table_auto_upgrade_operations_history": "system.storage.auto_upgrade_operations_history",
  },
  // Tables where this page uses a different status or scope than the docs overview, and why.
  status: {
    "system.sharing.materialization_history": "The table page says Public Preview. The overview page says GA.",
  },
  scope: {
    "system.access.audit": "Regional for workspace-level events. Global for account-level events.",
  },
};
