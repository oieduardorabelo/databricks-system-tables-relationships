// Databricks system tables: columns, primary keys and relationships.
//
// Column format: "name type"
//   - A leading "!" marks a primary key column (underlined in the diagram).
//   - A dotted name (for example "usage_metadata.job_id") is a field inside a struct.
//     The diagram shows only the last part, with a bullet.
//
// x / y are the start positions on the canvas. Users can drag tables; the page
// saves the new positions in the browser (localStorage).

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
    "account_id string", "workspace_id string", "record_id string", "sku_name string",
    "cloud string", "usage_metadata struct",
    "usage_metadata.job_id string", "usage_metadata.job_run_id string",
    "usage_metadata.notebook_id string", "usage_metadata.warehouse_id string",
    "usage_metadata.node_type string", "usage_metadata.cluster_id string",
    "usage_metadata.endpoint_id string", "usage_metadata.dlt_pipeline_id string",
    "usage_metadata.dlt_update_id string", "usage_metadata.dlt_maintenance_id string",
  ]},

  // ---------- system.lakeflow ----------
  { id: "system.lakeflow.jobs", x: 310, y: 450, cols: [
    "account_id string", "workspace_id string", "job_id string", "change_time timestamp",
  ]},
  { id: "system.lakeflow.job_tasks", x: 310, y: 580, cols: [
    "account_id string", "workspace_id string", "job_id string", "task_key string",
    "depends_on_task_keys array<string>", "change_time timestamp",
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
    "change_time timestamp", "change_date date", "delete_time timestamp", "create_time timestamp",
  ]},
  { id: "system.compute.warehouse_events", x: 985, y: 670, cols: [
    "account_id string", "workspace_id string", "warehouse_id string", "event_type string",
    "cluster_count integer", "event_time timestamp",
  ]},
  { id: "system.compute.node_types", x: 985, y: 860, cols: [
    "!account_id string", "!node_type string",
  ]},
  { id: "system.compute.clusters", x: 985, y: 990, cols: [
    "!workspace_id string", "!cluster_id string", "!change_time timestamp",
  ]},
  { id: "system.compute.node_timeline", x: 985, y: 1120, cols: [
    "!workspace_id string", "!cluster_id string", "!instance_id string",
    "!start_time timestamp", "!node_type string",
  ]},

  // ---------- system.query ----------
  { id: "system.query.history", x: 985, y: 1300, cols: [
    "account_id string", "workspace_id string", "statement_id string", "compute struct",
    "compute.warehouse_id string", "executed_by_user_id string", "query_source struct",
    "query_source.job_info struct", "query_source.job_info.job_task_run_id string",
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
];

// Relationships: [parentTable, parentColumn, childTable, childColumn, parentCard, childCard]
// Cardinality symbols (crow's foot notation):
//   one   = exactly one        (bar)
//   many  = many               (crow's foot)
//   zmany = zero or many       (circle + crow's foot)
//   omany = one or many        (bar + crow's foot)
// A null column attaches the line to the table header.
const WS = "system.access.workspaces_latest";
window.ERD_RELS = [
  // Workspace dimension
  [WS, "workspace_id", "system.access.table_lineage", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.lakeflow.jobs", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.lakeflow.job_tasks", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.lakeflow.job_run_timeline", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.lakeflow.job_task_run_timeline", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.compute.warehouses", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.compute.warehouse_events", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.compute.clusters", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.compute.node_timeline", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.query.history", "workspace_id", "one", "zmany"],
  [WS, "workspace_id", "system.billing.usage", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.serving.endpoint_usage", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.serving.served_entities", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.access.outbound_network", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.access.assistant_events", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.access.audit", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.mlflow.experiments_latest", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.mlflow.runs_latest", "workspace_id", "one", "many"],
  [WS, "workspace_id", "system.mlflow.run_metrics_history", "workspace_id", "one", "many"],

  // Lineage
  ["system.access.table_lineage", "entity_type", "system.access.column_lineage", "entity_type", "one", "zmany"],
  ["system.access.table_lineage", "entity_id", "system.access.column_lineage", "entity_id", "one", "zmany"],
  ["system.access.table_lineage", "entity_run_id", "system.access.column_lineage", "entity_run_id", "one", "zmany"],
  ["system.lakeflow.jobs", "job_id", "system.access.table_lineage", "entity_id", "one", "zmany"],
  ["system.lakeflow.job_run_timeline", "run_id", "system.access.table_lineage", "entity_run_id", "one", "zmany"],

  // Lakeflow jobs
  ["system.lakeflow.jobs", "job_id", "system.lakeflow.job_tasks", "job_id", "one", "zmany"],
  ["system.lakeflow.jobs", "job_id", "system.lakeflow.job_run_timeline", "job_id", "one", "zmany"],
  ["system.lakeflow.jobs", "job_id", "system.lakeflow.job_task_run_timeline", "job_id", "one", "many"],
  ["system.lakeflow.jobs", "job_id", "system.billing.usage", "usage_metadata.job_id", "one", "zmany"],
  ["system.lakeflow.job_tasks", "task_key", "system.lakeflow.job_tasks", "depends_on_task_keys", "one", "many"],
  ["system.lakeflow.job_tasks", "task_key", "system.lakeflow.job_task_run_timeline", "task_key", "one", "many"],
  ["system.lakeflow.job_run_timeline", "run_id", "system.lakeflow.job_task_run_timeline", "job_run_id", "one", "many"],
  ["system.lakeflow.job_run_timeline", "run_id", "system.billing.usage", "usage_metadata.job_run_id", "one", "zmany"],
  ["system.lakeflow.job_task_run_timeline", "run_id", "system.query.history", "query_source.job_info.job_task_run_id", "one", "many"],

  // Compute
  ["system.compute.warehouses", "warehouse_id", "system.compute.warehouse_events", "warehouse_id", "one", "zmany"],
  ["system.compute.warehouses", "warehouse_id", "system.query.history", "compute.warehouse_id", "one", "many"],
  ["system.compute.warehouses", "warehouse_id", "system.billing.usage", "usage_metadata.warehouse_id", "one", "many"],
  ["system.compute.warehouses", "warehouse_id", "system.lakeflow.job_task_run_timeline", "compute_ids", "one", "zmany"],
  ["system.compute.clusters", "cluster_id", "system.compute.node_timeline", "cluster_id", "one", "zmany"],
  ["system.compute.clusters", "cluster_id", "system.billing.usage", "usage_metadata.cluster_id", "one", "zmany"],
  ["system.compute.clusters", "cluster_id", "system.lakeflow.job_task_run_timeline", "compute_ids", "one", "zmany"],
  ["system.compute.node_types", "node_type", "system.compute.node_timeline", "node_type", "one", "zmany"],
  ["system.compute.node_types", "node_type", "system.billing.usage", "usage_metadata.node_type", "one", "zmany"],
  ["system.compute.node_types", "node_type", "system.compute.clusters", null, "one", "zmany"],

  // Billing
  ["system.billing.list_prices", "sku_name", "system.billing.usage", "sku_name", "one", "many"],

  // Serving
  ["system.serving.served_entities", "served_entity_id", "system.serving.endpoint_usage", "served_entity_id", "one", "many"],
  ["system.serving.served_entities", "endpoint_id", "system.billing.usage", "usage_metadata.endpoint_id", "one", "many"],

  // MLflow
  ["system.mlflow.experiments_latest", "experiment_id", "system.mlflow.runs_latest", "experiment_id", "one", "many"],
  ["system.mlflow.experiments_latest", "experiment_id", "system.mlflow.run_metrics_history", "experiment_id", "one", "many"],
  ["system.mlflow.runs_latest", "run_id", "system.mlflow.run_metrics_history", "run_id", "one", "many"],

  // Marketplace
  ["system.marketplace.listing_access_events", "provider_id", "system.marketplace.listing_funnel_events", "provider_id", "one", "omany"],
  ["system.marketplace.listing_access_events", "listing_id", "system.marketplace.listing_funnel_events", "listing_id", "one", "omany"],
];

// Account vs region scope (only the tables that the source names).
window.ERD_SCOPE = {
  "system.billing.usage": "global",
  "system.billing.list_prices": "global",
  "system.access.workspaces_latest": "global",
  "system.compute.warehouses": "regional",
  "system.compute.warehouse_events": "regional",
  "system.query.history": "regional",
  "system.access.audit": "regional",
};

window.ERD_KEY_JOINS = [
  ["system.billing.usage", "usage_metadata.warehouse_id", "system.compute.warehouses", "warehouse_id"],
  ["system.billing.usage", "workspace_id", "system.access.workspaces_latest", "workspace_id"],
  ["system.compute.warehouse_events", "warehouse_id", "system.compute.warehouses", "warehouse_id"],
  ["system.query.history", "compute.warehouse_id", "system.compute.warehouses", "warehouse_id"],
];
