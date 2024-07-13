/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `BigInt` scalar type represents non-fractional whole numeric values.
   * `BigInt` is not constrained to 32-bit like the `Int` type and thus is a less
   * compatible type.
   */
  BigInt: any;
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: any;
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
  /** Represents a JSON serialized string. */
  JSONString: any;
  /**
   * Leverages the internal Python implementation of UUID (uuid.UUID) to provide native UUID objects
   * in fields, resolvers and input.
   */
  UUID: any;
};

/** Represents an action that is available on a Component. */
export type Action = Node & {
  __typename?: 'Action';
  /** Specifies whether the signed-in User can remove the Action. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Action. */
  allowUpdate: Scalars['Boolean'];
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching: Scalars['Boolean'];
  /** The AuthorizationMethods that are supported by the Action. */
  authorizationMethods: AuthorizationMethodConnection;
  /** Specifies whether the Action requires authorization to function. */
  authorizationRequired?: Maybe<Scalars['Boolean']>;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: Maybe<Scalars['Boolean']>;
  /** The Component to which this Action is associated. */
  component?: Maybe<Component>;
  /** Specifies the type of the resulting data from the data source. */
  dataSourceType?: Maybe<ActionDataSourceType>;
  /** Additional notes about the Action. */
  description: Scalars['String'];
  /** The Data Source in this Component which can provide additional details about the content for this Data Source, such as example values when selecting particular API object fields. */
  detailDataSource?: Maybe<Action>;
  /** Notes which may provide insight on the intended use of the Action. */
  directions?: Maybe<Scalars['String']>;
  /** A string that associates an Input with Dynamic Branching. */
  dynamicBranchInput: Scalars['String'];
  /** An example of the returned payload of an Action. */
  examplePayload?: Maybe<Scalars['JSONString']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Specifies whether the Action is important and/or commonly used. */
  important: Scalars['Boolean'];
  /** The Action to which this InputField is associated, if any. */
  inputs: InputFieldConnection;
  /** Specifies whether the Action is a commonly used Trigger. */
  isCommonTrigger?: Maybe<Scalars['Boolean']>;
  /** Specifies whether the Action is a Data Source. */
  isDataSource: Scalars['Boolean'];
  /** Specifies whether the Action is a Trigger. */
  isTrigger: Scalars['Boolean'];
  /** A string that uniquely identifies this Action within the context of the Component. */
  key: Scalars['String'];
  /** The name of the Action. */
  label: Scalars['String'];
  /** Specifies support for triggering an Integration on a recurring schedule. */
  scheduleSupport?: Maybe<ActionScheduleSupport>;
  /** The static branch names associated with an Action. */
  staticBranchNames?: Maybe<Array<Scalars['String']>>;
  /** Specifies support for synchronous responses to an Integration webhook request. */
  synchronousResponseSupport?: Maybe<ActionSynchronousResponseSupport>;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution: Scalars['Boolean'];
};


/** Represents an action that is available on a Component. */
export type ActionAuthorizationMethodsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/** Represents an action that is available on a Component. */
export type ActionInputsArgs = {
  action?: InputMaybe<Scalars['ID']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  shown?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<Scalars['String']>;
  type_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/** Represents a Relay Connection to a collection of Action objects. */
export type ActionConnection = {
  __typename?: 'ActionConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ActionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Action>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** An enumeration. */
export enum ActionDataSourceType {
  /** Boolean */
  Boolean = 'BOOLEAN',
  /** Code */
  Code = 'CODE',
  /** Connection */
  Connection = 'CONNECTION',
  /** Credential */
  Credential = 'CREDENTIAL',
  /** Date */
  Date = 'DATE',
  /** Jsonform */
  Jsonform = 'JSONFORM',
  /** Number */
  Number = 'NUMBER',
  /** Objectfieldmap */
  Objectfieldmap = 'OBJECTFIELDMAP',
  /** Objectselection */
  Objectselection = 'OBJECTSELECTION',
  /** Picklist */
  Picklist = 'PICKLIST',
  /** Schedule */
  Schedule = 'SCHEDULE',
  /** String */
  String = 'STRING',
  /** Timestamp */
  Timestamp = 'TIMESTAMP'
}

/** Represents a collection of data that defines a Component Action. */
export type ActionDefinitionInput = {
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching?: InputMaybe<Scalars['Boolean']>;
  /** Specifies how the Action handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: InputMaybe<Scalars['Boolean']>;
  /** Specifies how the Component Action is displayed. */
  display: ActionDisplayDefinition;
  /** The input associated with dynamic branching. */
  dynamicBranchInput?: InputMaybe<Scalars['String']>;
  /** An example of the returned payload of an Action. */
  examplePayload?: InputMaybe<Scalars['JSONString']>;
  /** The InputFields supported by the Component Action. */
  inputs: Array<InputMaybe<InputFieldDefinition>>;
  /** A string which uniquely identifies the Action in the context of the Component. */
  key: Scalars['String'];
  /** The static branch names associated with an Action. */
  staticBranchNames?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution?: InputMaybe<Scalars['Boolean']>;
};

/** Represents a collection of data that defines how a Component Action is displayed. */
export type ActionDisplayDefinition = {
  /** The category of the Component. */
  category?: InputMaybe<Scalars['String']>;
  /** Additional notes about the Component. */
  description: Scalars['String'];
  /** Notes which may provide insight on the intended use of the Action. */
  directions?: InputMaybe<Scalars['String']>;
  /** Specifies whether the Action is important and/or commonly used. */
  important?: InputMaybe<Scalars['Boolean']>;
  /** The name of the Component. */
  label: Scalars['String'];
};

/** A Relay edge to a related Action object and a cursor for pagination. */
export type ActionEdge = {
  __typename?: 'ActionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Action>;
};

/** Allows specifying which field and direction to order by. */
export type ActionOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ActionOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ActionOrderField {
  IsCommonTrigger = 'IS_COMMON_TRIGGER',
  IsDataSource = 'IS_DATA_SOURCE',
  IsTrigger = 'IS_TRIGGER',
  Label = 'LABEL'
}

/** An enumeration. */
export enum ActionScheduleSupport {
  /** Invalid */
  Invalid = 'INVALID',
  /** Required */
  Required = 'REQUIRED',
  /** Valid */
  Valid = 'VALID'
}

/** An enumeration. */
export enum ActionSynchronousResponseSupport {
  /** Invalid */
  Invalid = 'INVALID',
  /** Required */
  Required = 'REQUIRED',
  /** Valid */
  Valid = 'VALID'
}

export type Activity = Node & {
  __typename?: 'Activity';
  /** Specifies whether the signed-in User can remove the Activity. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Activity. */
  allowUpdate: Scalars['Boolean'];
  /** Description of an activity performed by a user */
  description: Scalars['String'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** Date/Time when an activity occurred */
  timestamp: Scalars['DateTime'];
  /** User that performed an activity */
  user?: Maybe<User>;
  /** Name of the user that performed the activity */
  userName: Scalars['String'];
};

/** Represents a Relay Connection to a collection of Activity objects. */
export type ActivityConnection = {
  __typename?: 'ActivityConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ActivityEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Activity>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related Activity object and a cursor for pagination. */
export type ActivityEdge = {
  __typename?: 'ActivityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Activity>;
};

/** Allows specifying which field and direction to order by. */
export type ActivityOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ActivityOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ActivityOrderField {
  Timestamp = 'TIMESTAMP'
}

export type AdministerObjectPermissionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Specifies whether to grant or revoke the specified Permission. */
  grant: Scalars['Boolean'];
  /** The ID of the User to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The object for which the specified Permission is being granted. */
  object: Scalars['ID'];
  /** The Permission to grant for the specified object. */
  permission: Scalars['ID'];
};

export type AdministerObjectPermissionPayload = {
  __typename?: 'AdministerObjectPermissionPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

/**
 * Represents a specific instance of an Event that triggered a specific Alert
 * Monitor.
 */
export type AlertEvent = Node & {
  __typename?: 'AlertEvent';
  /** Specifies whether the signed-in User can remove the AlertEvent. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the AlertEvent. */
  allowUpdate: Scalars['Boolean'];
  /** The timestamp at which the object was created. */
  createdAt: Scalars['DateTime'];
  /** Additional information about the event. */
  details: Scalars['String'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The AlertMonitor to which the AlertEvent is associated. */
  monitor: AlertMonitor;
};

/** Represents a Relay Connection to a collection of AlertEvent objects. */
export type AlertEventConnection = {
  __typename?: 'AlertEventConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertEventEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertEvent>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related AlertEvent object and a cursor for pagination. */
export type AlertEventEdge = {
  __typename?: 'AlertEventEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertEvent>;
};

/** Allows specifying which field and direction to order by. */
export type AlertEventOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertEventOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertEventOrderField {
  CreatedAt = 'CREATED_AT',
  Customer = 'CUSTOMER',
  Details = 'DETAILS',
  FlowConfig = 'FLOW_CONFIG',
  Instance = 'INSTANCE',
  Integration = 'INTEGRATION',
  Monitor = 'MONITOR',
  Triggers = 'TRIGGERS'
}

/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroup = Node & {
  __typename?: 'AlertGroup';
  /** Specifies whether the signed-in User can remove the AlertGroup. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the AlertGroup. */
  allowUpdate: Scalars['Boolean'];
  /** The timestamp at which the object was created. */
  createdAt: Scalars['DateTime'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  monitors: AlertMonitorConnection;
  /** The name of the AlertGroup */
  name: Scalars['String'];
  /** The users in the AlertGroup. */
  users: UserConnection;
  /** The AlertWebhooks in the AlertGroup */
  webhooks: AlertWebhookConnection;
};


/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroupMonitorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars['DateTime']>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars['DateTime']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars['Boolean']>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  triggers_Name_Icontains?: InputMaybe<Scalars['String']>;
};


/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroupUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  email_Icontains?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  externalId_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
};


/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroupWebhooksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertWebhookOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertWebhookOrder>>>;
  url_Icontains?: InputMaybe<Scalars['String']>;
};

/** Represents a Relay Connection to a collection of AlertGroup objects. */
export type AlertGroupConnection = {
  __typename?: 'AlertGroupConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertGroupEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertGroup>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related AlertGroup object and a cursor for pagination. */
export type AlertGroupEdge = {
  __typename?: 'AlertGroupEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertGroup>;
};

/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitor = Node & {
  __typename?: 'AlertMonitor';
  /** Specifies whether the signed-in User can remove the AlertMonitor. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the AlertMonitor. */
  allowUpdate: Scalars['Boolean'];
  /** The timestamp at which the object was created. */
  createdAt: Scalars['DateTime'];
  /** The execution duration condition to monitor for relevant AlertTrigger types. */
  durationSecondsCondition?: Maybe<Scalars['Int']>;
  /** The AlertMonitor to which the AlertEvent is associated. */
  events: AlertEventConnection;
  /** The execution overdue condition to monitor for relevant AlertTrigger types. */
  executionOverdueMinutesCondition?: Maybe<Scalars['Int']>;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  groups: AlertGroupConnection;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Instance that is being monitored by the AlertMonitor. */
  instance: Instance;
  /** The timestamp when the AlertMonitor was last triggered. */
  lastTriggeredAt?: Maybe<Scalars['DateTime']>;
  /** The log severity level condition to monitor for relevant AlertTrigger types. */
  logSeverityLevelCondition?: Maybe<Scalars['Int']>;
  /** The name of the AlertMonitor. */
  name: Scalars['String'];
  /** Specifies whether the AlertMonitor is currently triggered. */
  triggered: Scalars['Boolean'];
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  triggers: AlertTriggerConnection;
  /** The Users to notify when the AlertMonitor is triggered. */
  users: UserConnection;
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  webhooks: AlertWebhookConnection;
};


/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAt_Gte?: InputMaybe<Scalars['DateTime']>;
  createdAt_Lte?: InputMaybe<Scalars['DateTime']>;
  details_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  monitor?: InputMaybe<Scalars['ID']>;
  monitor_FlowConfig?: InputMaybe<Scalars['ID']>;
  monitor_Instance?: InputMaybe<Scalars['ID']>;
  monitor_Instance_Customer?: InputMaybe<Scalars['ID']>;
  monitor_Instance_Integration?: InputMaybe<Scalars['ID']>;
  monitor_Instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  monitor_Name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertEventOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertEventOrder>>>;
};


/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorTriggersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  isInstanceSpecific?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertTriggerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertTriggerOrder>>>;
};


/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  email_Icontains?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  externalId_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
};


/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorWebhooksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertWebhookOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertWebhookOrder>>>;
  url_Icontains?: InputMaybe<Scalars['String']>;
};

/** Represents a Relay Connection to a collection of AlertMonitor objects. */
export type AlertMonitorConnection = {
  __typename?: 'AlertMonitorConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertMonitorEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertMonitor>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related AlertMonitor object and a cursor for pagination. */
export type AlertMonitorEdge = {
  __typename?: 'AlertMonitorEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertMonitor>;
};

/** Allows specifying which field and direction to order by. */
export type AlertMonitorOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertMonitorOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertMonitorOrderField {
  Customer = 'CUSTOMER',
  FlowConfig = 'FLOW_CONFIG',
  FlowConfigFlow = 'FLOW_CONFIG__FLOW',
  Instance = 'INSTANCE',
  Integration = 'INTEGRATION',
  LastTriggeredAt = 'LAST_TRIGGERED_AT',
  Name = 'NAME',
  Triggered = 'TRIGGERED',
  Triggers = 'TRIGGERS'
}

/** Represents a type of event in the system that can trigger an AlertMonitor. */
export type AlertTrigger = Node & {
  __typename?: 'AlertTrigger';
  /** Specifies whether the signed-in User can remove the AlertTrigger. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the AlertTrigger. */
  allowUpdate: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** Specifies whether the AlertTrigger is specific to an Instance rather than an InstanceFlowConfig. */
  isInstanceSpecific: Scalars['Boolean'];
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  monitors: AlertMonitorConnection;
  /** The name of the AlertTrigger. */
  name: Scalars['String'];
};


/** Represents a type of event in the system that can trigger an AlertMonitor. */
export type AlertTriggerMonitorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars['DateTime']>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars['DateTime']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars['Boolean']>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  triggers_Name_Icontains?: InputMaybe<Scalars['String']>;
};

/** Represents a Relay Connection to a collection of AlertTrigger objects. */
export type AlertTriggerConnection = {
  __typename?: 'AlertTriggerConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertTriggerEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertTrigger>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related AlertTrigger object and a cursor for pagination. */
export type AlertTriggerEdge = {
  __typename?: 'AlertTriggerEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertTrigger>;
};

/** Allows specifying which field and direction to order by. */
export type AlertTriggerOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertTriggerOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertTriggerOrderField {
  Name = 'NAME'
}

/** Represents a Webhook that is used for the purposes of alert notification. */
export type AlertWebhook = Node & {
  __typename?: 'AlertWebhook';
  /** Specifies whether the signed-in User can remove the AlertWebhook. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the AlertWebhook. */
  allowUpdate: Scalars['Boolean'];
  /** The AlertWebhooks in the AlertGroup */
  groups: AlertGroupConnection;
  /** A JSON string of key/value pairs that will be sent as headers in the Webhook request. */
  headers?: Maybe<Scalars['JSONString']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  monitors: AlertMonitorConnection;
  /** The name of the AlertWebhook. */
  name: Scalars['String'];
  /** The template that is hydrated and then used as the body of the AlertWebhook request. */
  payloadTemplate: Scalars['String'];
  /** The URL of the AlertWebhook. */
  url: Scalars['String'];
};


/** Represents a Webhook that is used for the purposes of alert notification. */
export type AlertWebhookGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/** Represents a Webhook that is used for the purposes of alert notification. */
export type AlertWebhookMonitorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars['DateTime']>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars['DateTime']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars['Boolean']>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  triggers_Name_Icontains?: InputMaybe<Scalars['String']>;
};

/** Represents a Relay Connection to a collection of AlertWebhook objects. */
export type AlertWebhookConnection = {
  __typename?: 'AlertWebhookConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertWebhookEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertWebhook>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related AlertWebhook object and a cursor for pagination. */
export type AlertWebhookEdge = {
  __typename?: 'AlertWebhookEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertWebhook>;
};

/** Allows specifying which field and direction to order by. */
export type AlertWebhookOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertWebhookOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertWebhookOrderField {
  Name = 'NAME',
  Url = 'URL'
}

/** Represents the collection of data that defines an Attachment. */
export type Attachment = {
  __typename?: 'Attachment';
  /** The name of the Attachment. */
  name: Scalars['String'];
  /** The URL where the Attachment is located. */
  url: Scalars['String'];
};

/** Represents the collection of data that defines an Attachment. */
export type AttachmentInput = {
  /** The name of the Attachment. */
  name: Scalars['String'];
  /** The URL where the Attachment is located. */
  url: Scalars['String'];
};

/** Represents the collection of data that allows renaming an Attachment. */
export type AttachmentRenameInput = {
  /** The new name for the Attachment. */
  name: Scalars['String'];
  /** The old name of the Attachment. */
  oldName: Scalars['String'];
  /** The URL where the Attachment is located. */
  url: Scalars['String'];
};

/** Represents a type of object to which permissions may be assigned. */
export type AuthObjectType = Node & {
  __typename?: 'AuthObjectType';
  /** Specifies whether the signed-in User can remove the AuthObjectType. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the AuthObjectType. */
  allowUpdate: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** Name of the AuthObjectType. */
  name: Scalars['String'];
};

/** Represents a Relay Connection to a collection of AuthObjectType objects. */
export type AuthObjectTypeConnection = {
  __typename?: 'AuthObjectTypeConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AuthObjectTypeEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AuthObjectType>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related AuthObjectType object and a cursor for pagination. */
export type AuthObjectTypeEdge = {
  __typename?: 'AuthObjectTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<AuthObjectType>;
};

/** Allows specifying which field and direction to order by. */
export type AuthObjectTypeOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AuthObjectTypeOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AuthObjectTypeOrderField {
  Name = 'NAME'
}

/** Represents authorization details for a Component. */
export type AuthorizationDefinition = {
  /** The list of authorization methods supported by the Component. */
  methods: Array<InputMaybe<Scalars['String']>>;
  /** Specifies whether authorization is required for the Component. */
  required: Scalars['Boolean'];
};

/**
 * Represents a type of authorization that may be used to authorize an
 * interaction with an external resource by a Component Action.
 */
export type AuthorizationMethod = Node & {
  __typename?: 'AuthorizationMethod';
  /** Specifies whether the signed-in User can remove the AuthorizationMethod. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the AuthorizationMethod. */
  allowUpdate: Scalars['Boolean'];
  /** Additional notes about the AuthorizationMethod. */
  description: Scalars['String'];
  /** The AuthorizationMethod that the CredentialField is associated to. */
  fields: CredentialFieldConnection;
  /** The ID of the object */
  id: Scalars['ID'];
  /** A string which uniquely identifies the AuthorizationMethod. */
  key: Scalars['String'];
  /** The name of the AuthorizationMethod. */
  label: Scalars['String'];
};


/**
 * Represents a type of authorization that may be used to authorize an
 * interaction with an external resource by a Component Action.
 */
export type AuthorizationMethodFieldsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

/** Represents a Relay Connection to a collection of AuthorizationMethod objects. */
export type AuthorizationMethodConnection = {
  __typename?: 'AuthorizationMethodConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AuthorizationMethodEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AuthorizationMethod>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related AuthorizationMethod object and a cursor for pagination. */
export type AuthorizationMethodEdge = {
  __typename?: 'AuthorizationMethodEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<AuthorizationMethod>;
};

export type BulkUpdateInstancesToLatestIntegrationVersionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type BulkUpdateInstancesToLatestIntegrationVersionPayload = {
  __typename?: 'BulkUpdateInstancesToLatestIntegrationVersionPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type ChangePasswordInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The current password. */
  currentPassword: Scalars['String'];
  /** The new password. */
  newPassword: Scalars['String'];
};

export type ChangePasswordPayload = {
  __typename?: 'ChangePasswordPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

export type ClearAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type ClearAlertMonitorPayload = {
  __typename?: 'ClearAlertMonitorPayload';
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type Component = Node & {
  __typename?: 'Component';
  /** The Component to which this Action is associated. */
  actions: ActionConnection;
  /** Specifies whether the signed-in User can manage Attachments related to this record. */
  allowManageAttachments?: Maybe<Scalars['Boolean']>;
  /** Specifies whether the signed-in User can remove the Component. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Component. */
  allowUpdate: Scalars['Boolean'];
  /** A JSON list of objects where each object has a key for name and URL that together describe the Attachment. */
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  /** A string that specifies the category of the Component. */
  category?: Maybe<Scalars['String']>;
  /** The Component to which this Connection is associated. */
  connections: ConnectionConnection;
  /** The Customer the Component belongs to, if any. If this is NULL then the Component belongs to the Organization. */
  customer?: Maybe<Customer>;
  /** Additional notes about the Component. */
  description: Scalars['String'];
  /** The URL associated with the documentation of a Component. */
  documentationUrl?: Maybe<Scalars['String']>;
  /** The URL that specifies where the Component icon exists. */
  iconUrl?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** A string that uniquely identifies the Component. */
  key: Scalars['String'];
  /** The name of the Component. */
  label: Scalars['String'];
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars['String']>>;
  /** Specifies whether the Component is publicly available or whether it's private to the Organization. */
  public: Scalars['Boolean'];
  /** A combination of the Component label, Component description, and every Action label and Action description for the Component to be used for searching. */
  searchTerms?: Maybe<Scalars['String']>;
  /** The hex-encoded SHA1 hash of the uploaded Component package. */
  signature: Scalars['String'];
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars['Boolean']>;
  /** Additional comments about this version. */
  versionComment?: Maybe<Scalars['String']>;
  /** Timestamp of the creation of this version. */
  versionCreatedAt?: Maybe<Scalars['DateTime']>;
  /** User that created this version. */
  versionCreatedBy?: Maybe<User>;
  /** Indicates if the version is available for use. */
  versionIsAvailable: Scalars['Boolean'];
  /** Marked if this record is the latest version of this sequence. */
  versionIsLatest: Scalars['Boolean'];
  /** Sequential number identifying this version. */
  versionNumber: Scalars['Int'];
  /** Sequence of versions of this Component */
  versionSequence: ComponentConnection;
  /** Identifier for this version sequence. */
  versionSequenceId?: Maybe<Scalars['UUID']>;
  /** The Versions of the Component that are available. */
  versions?: Maybe<VersionConnection>;
};


/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentActionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  component?: InputMaybe<Scalars['ID']>;
  dataSourceType?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  isCommonTrigger?: InputMaybe<Scalars['Boolean']>;
  isDataSource?: InputMaybe<Scalars['Boolean']>;
  isTrigger?: InputMaybe<Scalars['Boolean']>;
  key?: InputMaybe<Scalars['String']>;
  key_Icontains?: InputMaybe<Scalars['String']>;
  label_Fulltext?: InputMaybe<Scalars['String']>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ActionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ActionOrder>>>;
};


/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentConnectionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  component?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  key_Icontains?: InputMaybe<Scalars['String']>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  oauth2Type?: InputMaybe<Scalars['String']>;
  oauth2Type_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ConnectionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ConnectionOrder>>>;
};


/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentVersionSequenceArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars['Boolean']>;
  searchTerms_Fulltext?: InputMaybe<Scalars['String']>;
  searchTerms_Icontains?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentVersionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VersionOrder>;
};

/** Represents a component category. */
export type ComponentCategory = Node & {
  __typename?: 'ComponentCategory';
  /** The ID of the object */
  id: Scalars['ID'];
  /** The name of the Component category. */
  name: Scalars['String'];
};

/** Represents a Relay Connection to a collection of Component objects. */
export type ComponentConnection = {
  __typename?: 'ComponentConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ComponentEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Component>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** Represents a collection of data that defines a Component. */
export type ComponentDefinitionInput = {
  /** Specifies how the Component handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** Specifies how the Component is displayed. */
  display: ComponentDisplayDefinition;
  /** The URL that specifies where the Component documentation exists. */
  documentationUrl?: InputMaybe<Scalars['String']>;
  /** A string that uniquely identifies the Component. */
  key: Scalars['String'];
  /** Specifies whether the Component is publicly available or whether it's private to the Organization. */
  public?: InputMaybe<Scalars['Boolean']>;
  /** This field has been deprecated. */
  version?: InputMaybe<Scalars['String']>;
};

/** Represents a collection of data that defines how a Component is displayed. */
export type ComponentDisplayDefinition = {
  /** The category of the Component. */
  category?: InputMaybe<Scalars['String']>;
  /** Additional notes about the Component. */
  description: Scalars['String'];
  /** The URL that specifies where the Component icon exists. */
  iconPath?: InputMaybe<Scalars['String']>;
  /** The name of the Component. */
  label: Scalars['String'];
};

/** A Relay edge to a related Component object and a cursor for pagination. */
export type ComponentEdge = {
  __typename?: 'ComponentEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Component>;
};

/** Allows specifying which field and direction to order by. */
export type ComponentOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ComponentOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ComponentOrderField {
  Category = 'CATEGORY',
  Customer = 'CUSTOMER',
  Description = 'DESCRIPTION',
  Label = 'LABEL',
  VersionNumber = 'VERSION_NUMBER'
}

/** Represents a Connection that is available on a Component. */
export type Connection = Node & {
  __typename?: 'Connection';
  /** Specifies whether the signed-in User can remove the Connection. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Connection. */
  allowUpdate: Scalars['Boolean'];
  /** Additional notes about the Connection. */
  comments?: Maybe<Scalars['String']>;
  /** The Component to which this Connection is associated. */
  component: Component;
  /** Specifies this Connection is the default for the Component. */
  default: Scalars['Boolean'];
  /** The URL that specifies where the Connection icon exists. */
  iconUrl?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Connection to which this InputField is associated, if any. */
  inputs: InputFieldConnection;
  /** A string which uniquely identifies the Connection in the context of the Action. */
  key: Scalars['String'];
  /** The name of the Connection. */
  label: Scalars['String'];
  /** The OAuth2 flow type, if any, for this Connection. */
  oauth2Type?: Maybe<ConnectionOauth2Type>;
  /** Ordering of the Connection. */
  order?: Maybe<Scalars['Int']>;
};


/** Represents a Connection that is available on a Component. */
export type ConnectionInputsArgs = {
  action?: InputMaybe<Scalars['ID']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  shown?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<Scalars['String']>;
  type_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/** Represents a Relay Connection to a collection of Connection objects. */
export type ConnectionConnection = {
  __typename?: 'ConnectionConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ConnectionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Connection>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** Represents a collection of data that defines a Component Connection. */
export type ConnectionDefinitionInput = {
  /** Additional notes about the Connection. */
  comments?: InputMaybe<Scalars['String']>;
  /** Optional path to icon for this Connection. */
  iconPath?: InputMaybe<Scalars['String']>;
  /** Inputs for this Connection. */
  inputs?: InputMaybe<Array<InputMaybe<ConnectionInputFieldDefinition>>>;
  /** A string which uniquely identifies the Connection in the context of the Component. */
  key: Scalars['String'];
  /** The name of the Connection. */
  label: Scalars['String'];
  /** Type of OAuth2 connection, if any. */
  oauth2Type?: InputMaybe<Scalars['String']>;
};

/** A Relay edge to a related Connection object and a cursor for pagination. */
export type ConnectionEdge = {
  __typename?: 'ConnectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Connection>;
};

export type ConnectionIconUploadUrl = {
  __typename?: 'ConnectionIconUploadUrl';
  connectionKey?: Maybe<Scalars['String']>;
  iconUploadUrl?: Maybe<Scalars['String']>;
};

/** Represents an input field for a Connection. */
export type ConnectionInputFieldDefinition = {
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: InputMaybe<Scalars['String']>;
  /** Additional notes about the InputField. */
  comments?: InputMaybe<Scalars['String']>;
  /** The default value for the InputField. */
  default?: InputMaybe<Scalars['String']>;
  /** An example valid input for this InputField. */
  example?: InputMaybe<Scalars['String']>;
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: Scalars['String'];
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: InputMaybe<Scalars['String']>;
  /** The name of the InputField. */
  label: Scalars['String'];
  /** Language to use for the Code Field. */
  language?: InputMaybe<Scalars['String']>;
  /** Dictates how possible choices are provided for this InputField. */
  model?: InputMaybe<Array<InputMaybe<InputFieldChoice>>>;
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: InputMaybe<Scalars['String']>;
  /** Specifies whether the InputField is required by the Action. */
  required?: InputMaybe<Scalars['Boolean']>;
  /** Whether or not the field is shown to Integrators and Deployers. Field must have a default is this is `false`. */
  shown?: InputMaybe<Scalars['Boolean']>;
  /** Specifies the type of data the InputField handles. */
  type: Scalars['String'];
};

/** An enumeration. */
export enum ConnectionOauth2Type {
  /** Authorization Code */
  AuthorizationCode = 'AUTHORIZATION_CODE',
  /** Client Credentials */
  ClientCredentials = 'CLIENT_CREDENTIALS'
}

/** Allows specifying which field and direction to order by. */
export type ConnectionOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ConnectionOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ConnectionOrderField {
  Key = 'KEY',
  Label = 'LABEL',
  Order = 'ORDER'
}

export type CreateAlertGroupInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The name of the AlertGroup */
  name?: InputMaybe<Scalars['String']>;
  /** The users in the AlertGroup. */
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The AlertWebhooks in the AlertGroup */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type CreateAlertGroupPayload = {
  __typename?: 'CreateAlertGroupPayload';
  alertGroup?: Maybe<AlertGroup>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type CreateAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The execution duration condition to monitor for relevant AlertTrigger types. */
  durationSecondsCondition?: InputMaybe<Scalars['Int']>;
  /** The execution overdue condition to monitor for relevant AlertTrigger types. */
  executionOverdueMinutesCondition?: InputMaybe<Scalars['Int']>;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  flowConfig?: InputMaybe<Scalars['ID']>;
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  groups?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The Instance that is being monitored by the AlertMonitor. */
  instance?: InputMaybe<Scalars['ID']>;
  /** The log severity level condition to monitor for relevant AlertTrigger types. */
  logSeverityLevelCondition?: InputMaybe<Scalars['Int']>;
  /** The name of the AlertMonitor. */
  name: Scalars['String'];
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The Users to notify when the AlertMonitor is triggered. */
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type CreateAlertMonitorPayload = {
  __typename?: 'CreateAlertMonitorPayload';
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type CreateAlertWebhookInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** A JSON string of key/value pairs that will be sent as headers in the Webhook request. */
  headers?: InputMaybe<Scalars['String']>;
  /** The name of the AlertWebhook. */
  name: Scalars['String'];
  /** The template that is hydrated and then used as the body of the AlertWebhook request. */
  payloadTemplate: Scalars['String'];
  /** The URL of the AlertWebhook. */
  url: Scalars['String'];
};

export type CreateAlertWebhookPayload = {
  __typename?: 'CreateAlertWebhookPayload';
  alertWebhook?: Maybe<AlertWebhook>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type CreateCustomerCredentialInput = {
  /** The specific AuthorizationMethod used by the Credential. */
  authorizationMethod: Scalars['ID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Customer the Credential belongs to, if any. If NULL then Organization will be specified. */
  customer?: InputMaybe<Scalars['ID']>;
  /** The name of the Credential. */
  label: Scalars['String'];
  /** A list of InputCredentialFieldValues that contain the values for the CredentialFields. */
  values?: InputMaybe<Array<InputMaybe<InputCredentialFieldValue>>>;
};

export type CreateCustomerCredentialPayload = {
  __typename?: 'CreateCustomerCredentialPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type CreateCustomerInput = {
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner?: InputMaybe<Scalars['Boolean']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Additional notes about the Customer. */
  description?: InputMaybe<Scalars['String']>;
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars['String']>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** The name of the Customer, which must be unique within the scope of its Organization. */
  name: Scalars['String'];
};

export type CreateCustomerPayload = {
  __typename?: 'CreateCustomerPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  customer?: Maybe<Customer>;
  errors: Array<ErrorType>;
};

export type CreateCustomerUserInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Customer the user belongs to, if any. If this is NULL then Organization will be specified. */
  customer?: InputMaybe<Scalars['ID']>;
  /** The email address associated with the User. */
  email: Scalars['String'];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars['String']>;
  /** The user's preferred name. */
  name?: InputMaybe<Scalars['String']>;
  /** The preferred contact phone number for the User. */
  phone?: InputMaybe<Scalars['String']>;
  role: Scalars['ID'];
};

export type CreateCustomerUserPayload = {
  __typename?: 'CreateCustomerUserPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

export type CreateExternalLogStreamInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** A JSON string of key/value pairs that will be sent as headers in the ExternalLogStream request. */
  headers?: InputMaybe<Scalars['String']>;
  /** Name of the ExternalLogStream. */
  name: Scalars['String'];
  /** The template that is hydrated and then used as the body of the ExternalLogStream request. */
  payloadTemplate: Scalars['String'];
  /** The Log severity levels for which Logs should be sent to the ExternalLogStream. */
  severityLevels: Array<InputMaybe<LogSeverityLevelInput>>;
  /** The URL of the ExternalLogStream. */
  url: Scalars['String'];
};

export type CreateExternalLogStreamPayload = {
  __typename?: 'CreateExternalLogStreamPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  externalLogStream?: Maybe<ExternalLogStream>;
};

export type CreateInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Config variable values that are associated with the Instance. */
  configVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** The Customer for which the Instance is deployed. */
  customer: Scalars['ID'];
  /** Additional notes about the Instance. */
  description?: InputMaybe<Scalars['String']>;
  /** Configuration data for each IntegrationFlow that is associated with the Instance. */
  flowConfigs?: InputMaybe<Array<InputMaybe<InputInstanceFlowConfig>>>;
  /** The Integration that has been deployed for the Instance. */
  integration: Scalars['ID'];
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** The name of the Instance. */
  name: Scalars['String'];
};

export type CreateInstancePayload = {
  __typename?: 'CreateInstancePayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type CreateIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: InputMaybe<Scalars['ID']>;
  /** The YAML serialized definition of the Integration to import. */
  definition?: InputMaybe<Scalars['String']>;
  /** Additional notes about the Integration. */
  description?: InputMaybe<Scalars['String']>;
  /** Content type of the payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestContentType?: InputMaybe<Scalars['String']>;
  /** A JSON string of key/value pairs that will be sent as headers when testing the endpoint configuration for this Integration. */
  endpointConfigTestHeaders?: InputMaybe<Scalars['String']>;
  /** Data payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestPayload?: InputMaybe<Scalars['String']>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** The name of the Integration. */
  name: Scalars['String'];
};

export type CreateIntegrationPayload = {
  __typename?: 'CreateIntegrationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type CreateOrganizationCredentialInput = {
  /** The specific AuthorizationMethod used by the Credential. */
  authorizationMethod: Scalars['ID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The name of the Credential. */
  label: Scalars['String'];
  /** A list of InputCredentialFieldValues that contain the values for the CredentialFields. */
  values?: InputMaybe<Array<InputMaybe<InputCredentialFieldValue>>>;
};

export type CreateOrganizationCredentialPayload = {
  __typename?: 'CreateOrganizationCredentialPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type CreateOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
};

export type CreateOrganizationSigningKeyPayload = {
  __typename?: 'CreateOrganizationSigningKeyPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  result?: Maybe<CreateOrganizationSigningKeyResult>;
};

export type CreateOrganizationSigningKeyResult = {
  __typename?: 'CreateOrganizationSigningKeyResult';
  privateKey?: Maybe<Scalars['String']>;
  signingKey?: Maybe<OrganizationSigningKey>;
};

export type CreateOrganizationUserInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The email address associated with the User. */
  email: Scalars['String'];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars['String']>;
  /** The user's preferred name. */
  name?: InputMaybe<Scalars['String']>;
  /** The preferred contact phone number for the User. */
  phone?: InputMaybe<Scalars['String']>;
  /** The Role to associate with the User. */
  role: Scalars['ID'];
};

export type CreateOrganizationUserPayload = {
  __typename?: 'CreateOrganizationUserPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

/**
 * Represents a collection of fields and an AuthorizationMethod that together
 * specify a complete set of data necessary for interaction with an external
 * resource by a Component Action as part of an Integration.
 */
export type Credential = Node & {
  __typename?: 'Credential';
  /** Specifies whether the signed-in User can remove the Credential. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Credential. */
  allowUpdate: Scalars['Boolean'];
  /** Contains any error message generated by the external authorizing system that occurred during authorization. */
  authorizationError: Scalars['String'];
  /** The specific AuthorizationMethod used by the Credential. */
  authorizationMethod: AuthorizationMethod;
  /** Contains OAuth2 context data if applicable. */
  context?: Maybe<Scalars['JSONString']>;
  /** The Customer the Credential belongs to, if any. If NULL then Organization will be specified. */
  customer?: Maybe<Customer>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The name of the Credential. */
  label: Scalars['String'];
  /** The Organization the Credential belongs to, if any. If NULL then Customer will be specified. */
  org?: Maybe<Organization>;
  /** Specifies whether the Credential is ready for use by an Instance. */
  readyForUse: Scalars['Boolean'];
  /** Contains the OAuth2 Redirect URI if applicable. */
  redirectUri?: Maybe<Scalars['String']>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars['DateTime']>;
  /** Contains OAuth2 token data if applicable. */
  token?: Maybe<Scalars['JSONString']>;
  /** A list of CredentialFieldValues that contain the values for the CredentialFields. */
  values?: Maybe<Array<Maybe<CredentialFieldValue>>>;
};

/** Represents a Relay Connection to a collection of Credential objects. */
export type CredentialConnection = {
  __typename?: 'CredentialConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CredentialEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Credential>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related Credential object and a cursor for pagination. */
export type CredentialEdge = {
  __typename?: 'CredentialEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Credential>;
};

/** Represents a specific field on a Credential. */
export type CredentialField = Node & {
  __typename?: 'CredentialField';
  /** Specifies whether the signed-in User can remove the CredentialField. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the CredentialField. */
  allowUpdate: Scalars['Boolean'];
  /** The AuthorizationMethod that the CredentialField is associated to. */
  authorizationMethod: AuthorizationMethod;
  /** Additional notes about the CredentialField. */
  comments: Scalars['String'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** A string which uniquely identifies the CredentialField in the context of the AuthorizationMethod. */
  key: Scalars['String'];
  /** The name of the CredentialField. */
  label: Scalars['String'];
  /** Placeholder text that will appear in the CredentialField UI. */
  placeholder: Scalars['String'];
  /** Specifies whether the CredentialField requires a value to be valid. */
  required: Scalars['Boolean'];
  /** Specifies the data type of the value for the CredentialField. */
  type: CredentialFieldType;
};

/** Represents a Relay Connection to a collection of CredentialField objects. */
export type CredentialFieldConnection = {
  __typename?: 'CredentialFieldConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CredentialFieldEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<CredentialField>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related CredentialField object and a cursor for pagination. */
export type CredentialFieldEdge = {
  __typename?: 'CredentialFieldEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<CredentialField>;
};

/** An enumeration. */
export enum CredentialFieldType {
  /** keyvalue */
  Keyvalue = 'KEYVALUE',
  /** password */
  Password = 'PASSWORD',
  /** string */
  String = 'STRING',
  /** text */
  Text = 'TEXT'
}

/** Represents a specific value of a CredentialField. */
export type CredentialFieldValue = {
  __typename?: 'CredentialFieldValue';
  /** The name associated with the CredentialField. */
  key: Scalars['String'];
  /** The value of the CredentialField. */
  value?: Maybe<Scalars['String']>;
};

/** Allows specifying which field and direction to order by. */
export type CredentialOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CredentialOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CredentialOrderField {
  AuthorizationMethod = 'AUTHORIZATION_METHOD',
  Customer = 'CUSTOMER',
  Label = 'LABEL'
}

/** Represents a Relay Connection to a collection of User Level Config Variable objects. */
export type CustomUserLevelConfigVariableConnection = {
  __typename?: 'CustomUserLevelConfigVariableConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CustomUserLevelConfigVariableEdge>>;
  /** List of nodes in this connection */
  nodes: Array<Maybe<UserLevelConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of config variables */
  totalCount: Scalars['Int'];
};

/** A Relay edge containing a `CustomUserLevelConfigVariable` and its cursor. */
export type CustomUserLevelConfigVariableEdge = {
  __typename?: 'CustomUserLevelConfigVariableEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<UserLevelConfigVariable>;
};

/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type Customer = Node & {
  __typename?: 'Customer';
  /** Specifies whether the signed-in User can add an Alert Monitor to the Customer. */
  allowAddAlertMonitor: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a Component to the Customer. */
  allowAddComponent: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a Credential to the Customer. */
  allowAddCredential: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add an Instance to the Customer. */
  allowAddInstance: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add an Integration to the Customer. */
  allowAddIntegration: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a User to the Customer. */
  allowAddUser: Scalars['Boolean'];
  /** Specifies whether the signed-in User's Customer has access to legacy Credentials. */
  allowConfigureCredentials: Scalars['Boolean'];
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner: Scalars['Boolean'];
  /** Specifies whether Instances may be enabled based on the utilization allowed by the current Plan. */
  allowEnableInstance: Scalars['Boolean'];
  /** Specifies whether Instances may be executed based on the utilization allowed by the current Plan. */
  allowExecuteInstance: Scalars['Boolean'];
  /** Specifies whether the signed-in User can manage Attachments related to this record. */
  allowManageAttachments?: Maybe<Scalars['Boolean']>;
  /** Specifies whether the signed-in User can remove the Customer. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Customer. */
  allowUpdate: Scalars['Boolean'];
  /** A JSON list of objects where each object has a key for name and URL that together describe the Attachment. */
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** The Customer the Component belongs to, if any. If this is NULL then the Component belongs to the Organization. */
  components: ComponentConnection;
  /** The Customer the Credential belongs to, if any. If NULL then Organization will be specified. */
  credentials: CredentialConnection;
  /** Additional notes about the Customer. */
  description: Scalars['String'];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Customer for which the Instance is deployed. */
  instances: InstanceConnection;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  integrations: IntegrationConnection;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars['String']>>;
  /** The name of the Customer, which must be unique within the scope of its Organization. */
  name: Scalars['String'];
  /** The Organization to which the Customer belongs. */
  org: Organization;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars['Boolean']>;
  /** The Customer the user belongs to, if any. If this is NULL then Organization will be specified. */
  users: UserConnection;
};


/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerComponentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  allVersions?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasActions?: InputMaybe<Scalars['Boolean']>;
  hasCommonTriggers?: InputMaybe<Scalars['Boolean']>;
  hasConnections?: InputMaybe<Scalars['Boolean']>;
  hasDataSources?: InputMaybe<Scalars['Boolean']>;
  hasDataSourcesOfType?: InputMaybe<Scalars['String']>;
  hasTriggers?: InputMaybe<Scalars['Boolean']>;
  key?: InputMaybe<Scalars['String']>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars['Boolean']>;
  searchTerms_Fulltext?: InputMaybe<Scalars['String']>;
  searchTerms_Icontains?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerCredentialsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorizationMethod_Key?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CredentialOrder>;
  readyForUse?: InputMaybe<Scalars['Boolean']>;
  sortBy?: InputMaybe<Array<InputMaybe<CredentialOrder>>>;
};


/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerInstancesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  compatibility?: InputMaybe<Scalars['Int']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_ExternalId?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  integration?: InputMaybe<Scalars['ID']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  needsDeploy?: InputMaybe<Scalars['Boolean']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
};


/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerIntegrationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  allVersions?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  category_Icontains?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasInstances?: InputMaybe<Scalars['Boolean']>;
  hasUnpublishedChanges?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  marketplace?: InputMaybe<Scalars['Boolean']>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  useAsTemplate?: InputMaybe<Scalars['Boolean']>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  email_Icontains?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  externalId_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
};

/** Represents a Relay Connection to a collection of Customer objects. */
export type CustomerConnection = {
  __typename?: 'CustomerConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CustomerEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Customer>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related Customer object and a cursor for pagination. */
export type CustomerEdge = {
  __typename?: 'CustomerEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Customer>;
};

/** Allows specifying which field and direction to order by. */
export type CustomerOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CustomerOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CustomerOrderField {
  Description = 'DESCRIPTION',
  Name = 'NAME'
}

/** Represents snapshots of total utilization metrics for a Customer. */
export type CustomerTotalUsageMetrics = Node & {
  __typename?: 'CustomerTotalUsageMetrics';
  /** Specifies whether the signed-in User can remove the CustomerTotalUsageMetrics. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the CustomerTotalUsageMetrics. */
  allowUpdate: Scalars['Boolean'];
  /** The Customer for which utilization metrics are being collected. */
  customer: Customer;
  /** The total number of Instances that are deployed. */
  deployedInstanceCount: Scalars['Int'];
  /** The total number of unique Integrations that are deployed. */
  deployedUniqueIntegrationCount: Scalars['Int'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The time the utilization metrics snapshot was created. */
  snapshotTime: Scalars['DateTime'];
  /** The total number of Users that currently exist. */
  userCount: Scalars['Int'];
};

/** Represents a Relay Connection to a collection of CustomerTotalUsageMetrics objects. */
export type CustomerTotalUsageMetricsConnection = {
  __typename?: 'CustomerTotalUsageMetricsConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CustomerTotalUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<CustomerTotalUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related CustomerTotalUsageMetrics object and a cursor for pagination. */
export type CustomerTotalUsageMetricsEdge = {
  __typename?: 'CustomerTotalUsageMetricsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<CustomerTotalUsageMetrics>;
};

/** Allows specifying which field and direction to order by. */
export type CustomerTotalUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CustomerTotalUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CustomerTotalUsageMetricsOrderField {
  SnapshotTime = 'SNAPSHOT_TIME'
}

/** Represents a collection of data that defines a Component Data Source. */
export type DataSourceDefinitionInput = {
  /** Specifies how the Data Source handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** The type of the resulting data from the Data Source. */
  dataSourceType: Scalars['String'];
  /** Specifies the key of a Data Source in this Component which can provide additional details about the content for this Data Source, such as example values when selecting particular API object fields. */
  detailDataSource?: InputMaybe<Scalars['String']>;
  /** Specifies how the Data Source is displayed. */
  display: ActionDisplayDefinition;
  /** An example of the returned payload of an Data Source. */
  examplePayload?: InputMaybe<Scalars['JSONString']>;
  /** The InputFields supported by the Data Source. */
  inputs: Array<InputMaybe<InputFieldDefinition>>;
  /** A string which uniquely identifies the Data Source in the context of the Component. */
  key: Scalars['String'];
};

export type DeleteAlertGroupInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the AlertGroup to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteAlertGroupPayload = {
  __typename?: 'DeleteAlertGroupPayload';
  alertGroup?: Maybe<AlertGroup>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type DeleteAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteAlertMonitorPayload = {
  __typename?: 'DeleteAlertMonitorPayload';
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type DeleteAlertWebhookInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the AlertWebhook to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteAlertWebhookPayload = {
  __typename?: 'DeleteAlertWebhookPayload';
  alertWebhook?: Maybe<AlertWebhook>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type DeleteComponentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Component to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteComponentPayload = {
  __typename?: 'DeleteComponentPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  component?: Maybe<Component>;
  errors: Array<ErrorType>;
};

export type DeleteCredentialInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Credential to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteCredentialPayload = {
  __typename?: 'DeleteCredentialPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type DeleteCustomerInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Customer to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteCustomerPayload = {
  __typename?: 'DeleteCustomerPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  customer?: Maybe<Customer>;
  errors: Array<ErrorType>;
};

export type DeleteExternalLogStreamInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the ExternalLogStream to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteExternalLogStreamPayload = {
  __typename?: 'DeleteExternalLogStreamPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  externalLogStream?: Maybe<ExternalLogStream>;
};

export type DeleteInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteInstancePayload = {
  __typename?: 'DeleteInstancePayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type DeleteIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteIntegrationPayload = {
  __typename?: 'DeleteIntegrationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type DeleteOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Organization to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteOrganizationPayload = {
  __typename?: 'DeleteOrganizationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  organization?: Maybe<Organization>;
};

export type DeleteOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the OrganizationSigningKey to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteOrganizationSigningKeyPayload = {
  __typename?: 'DeleteOrganizationSigningKeyPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  organizationSigningKey?: Maybe<OrganizationSigningKey>;
};

export type DeleteUserInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the User to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteUserLevelConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the UserLevelConfig to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteUserLevelConfigPayload = {
  __typename?: 'DeleteUserLevelConfigPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  userLevelConfig?: Maybe<UserLevelConfig>;
};

export type DeleteUserPayload = {
  __typename?: 'DeleteUserPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

export type DeployInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** When true, will deploy the instance, ignoring certain validation rules that would normally prevent deployment. */
  force?: InputMaybe<Scalars['Boolean']>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DeployInstancePayload = {
  __typename?: 'DeployInstancePayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type DisconnectConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the InstanceConfigVariable to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DisconnectConnectionPayload = {
  __typename?: 'DisconnectConnectionPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instanceConfigVariable?: Maybe<InstanceConfigVariable>;
};

export type DisconnectUserLevelConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the UserLevelConfigVariable to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type DisconnectUserLevelConnectionPayload = {
  __typename?: 'DisconnectUserLevelConnectionPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  userLevelConfigVariable?: Maybe<UserLevelConfigVariable>;
};

export type ErrorType = {
  __typename?: 'ErrorType';
  field: Scalars['String'];
  messages: Array<Scalars['String']>;
};

/**
 * Represents an expression that is used to reference Configuration
 * Variables and results from previous steps.
 */
export type Expression = Node & {
  __typename?: 'Expression';
  /** Specifies whether the signed-in User can remove the Expression. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Expression. */
  allowUpdate: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** An object that contains arbitrary meta data about an Expression */
  meta?: Maybe<Scalars['JSONString']>;
  /** The name of the Expression. */
  name: Scalars['String'];
  /** The type of the Expression. */
  type: ExpressionType;
  /** The value of the Expression. */
  value: Scalars['String'];
};

/** Represents a Relay Connection to a collection of Expression objects. */
export type ExpressionConnection = {
  __typename?: 'ExpressionConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ExpressionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Expression>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related Expression object and a cursor for pagination. */
export type ExpressionEdge = {
  __typename?: 'ExpressionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Expression>;
};

/** An enumeration. */
export enum ExpressionType {
  /** complex */
  Complex = 'COMPLEX',
  /** configVar */
  Configvar = 'CONFIGVAR',
  /** reference */
  Reference = 'REFERENCE',
  /** template */
  Template = 'TEMPLATE',
  /** value */
  Value = 'VALUE'
}

/**
 * Represents a configuration that specifies the details of an external system
 * that is used to ingest log messages generated by Instance Executions.
 */
export type ExternalLogStream = Node & {
  __typename?: 'ExternalLogStream';
  /** Specifies whether the signed-in User can remove the ExternalLogStream. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the ExternalLogStream. */
  allowUpdate: Scalars['Boolean'];
  /** A JSON string of key/value pairs that will be sent as headers in the ExternalLogStream request. */
  headers?: Maybe<Scalars['JSONString']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Name of the ExternalLogStream. */
  name: Scalars['String'];
  /** The template that is hydrated and then used as the body of the ExternalLogStream request. */
  payloadTemplate: Scalars['String'];
  /** The Log severity levels for which Logs should be sent to the ExternalLogStream. */
  severityLevels: Array<Maybe<LogSeverity>>;
  /** The URL of the ExternalLogStream. */
  url: Scalars['String'];
};

/** Represents a Relay Connection to a collection of ExternalLogStream objects. */
export type ExternalLogStreamConnection = {
  __typename?: 'ExternalLogStreamConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ExternalLogStreamEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ExternalLogStream>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related ExternalLogStream object and a cursor for pagination. */
export type ExternalLogStreamEdge = {
  __typename?: 'ExternalLogStreamEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<ExternalLogStream>;
};

/** Allows specifying which field and direction to order by. */
export type ExternalLogStreamOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ExternalLogStreamOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ExternalLogStreamOrderField {
  Name = 'NAME'
}

export type FetchConfigWizardPageContentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The name of the Configuration Page for which content should be fetched. */
  pageName?: InputMaybe<Scalars['String']>;
};

export type FetchConfigWizardPageContentPayload = {
  __typename?: 'FetchConfigWizardPageContentPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  fetchConfigWizardPageContentResult?: Maybe<FetchConfigWizardPageContentResult>;
};

/** Result of fetching Config Wizard Page content. */
export type FetchConfigWizardPageContentResult = {
  __typename?: 'FetchConfigWizardPageContentResult';
  /** The JSON string that contains a map of Config Var key to content for the widget for the associated Config Var. */
  content?: Maybe<Scalars['JSONString']>;
  /** The Instance for which Config Page content was fetched. */
  instance?: Maybe<Instance>;
  /** The name of the Configuration Page for which content was fetched. */
  pageName?: Maybe<Scalars['String']>;
};

export type FetchDataSourceContentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Data Source for which content should be fetched. */
  dataSource?: InputMaybe<Scalars['ID']>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** Input values for the specified Data Source. */
  inputs?: InputMaybe<Array<InputMaybe<InputExpression>>>;
};

export type FetchDataSourceContentPayload = {
  __typename?: 'FetchDataSourceContentPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  fetchDataSourceContentResult?: Maybe<FetchDataSourceContentResult>;
};

/** Result of fetching content for a single Data Source in the context of an Instance. */
export type FetchDataSourceContentResult = {
  __typename?: 'FetchDataSourceContentResult';
  /** The JSON string that contains the content for the specified Data Source. */
  content?: Maybe<Scalars['JSONString']>;
  /** The Data Source for which to fetch content. */
  dataSource?: Maybe<Action>;
  /** The Instance that is used as the context when fetching content for the specified Data Source. */
  instance?: Maybe<Instance>;
};

export type ForkIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Additional notes about the Integration. */
  description?: InputMaybe<Scalars['String']>;
  /** The name of the Integration. */
  name: Scalars['String'];
  /** Parent Integration this Integration was forked from, if any */
  parent: Scalars['ID'];
};

export type ForkIntegrationPayload = {
  __typename?: 'ForkIntegrationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type ImportIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: InputMaybe<Scalars['ID']>;
  /** The YAML serialized definition of the Integration to import. */
  definition: Scalars['String'];
  /** The ID of the Integration being imported. */
  integrationId?: InputMaybe<Scalars['ID']>;
};

export type ImportIntegrationPayload = {
  __typename?: 'ImportIntegrationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type ImportOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Public key of the Signing Keypair. */
  publicKey: Scalars['String'];
};

export type ImportOrganizationSigningKeyPayload = {
  __typename?: 'ImportOrganizationSigningKeyPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  organizationSigningKey?: Maybe<OrganizationSigningKey>;
};

/** Represents a specific value of a CredentialField. */
export type InputCredentialFieldValue = {
  /** The name associated with the CredentialField. */
  key: Scalars['String'];
  /** The value of the CredentialField. */
  value?: InputMaybe<Scalars['String']>;
};

/**
 * Represents an expression that is used to reference Configuration
 * Variables and results from previous steps.
 */
export type InputExpression = {
  meta?: InputMaybe<Scalars['String']>;
  /** The name of the Expression. */
  name: Scalars['String'];
  /** The type of the Expression. */
  type?: InputMaybe<Scalars['String']>;
  /** The value of the Expression. */
  value?: InputMaybe<Scalars['String']>;
};

/**
 * Represents an input field for a Component Action. Defines the basic
 * properties that must be satisfied by the input data.
 */
export type InputField = Node & {
  __typename?: 'InputField';
  /** The Action to which this InputField is associated, if any. */
  action?: Maybe<Action>;
  /** Specifies whether the signed-in User can remove the InputField. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the InputField. */
  allowUpdate: Scalars['Boolean'];
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: Maybe<InputFieldCollection>;
  /** Additional notes about the InputField. */
  comments?: Maybe<Scalars['String']>;
  /** The Connection to which this InputField is associated, if any. */
  connection?: Maybe<Connection>;
  /** The default value for the InputField. */
  default?: Maybe<Scalars['String']>;
  /** Example valid input for the InputField. */
  example?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: Scalars['String'];
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: Maybe<Scalars['String']>;
  /** The name of the InputField. */
  label: Scalars['String'];
  /** Language to use for the Code Field. */
  language?: Maybe<Scalars['String']>;
  /** Dictates how possible choices are provided for this InputField. */
  model?: Maybe<Scalars['JSONString']>;
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: Maybe<Scalars['String']>;
  /** Specifies whether the InputField is required by the Action. */
  required: Scalars['Boolean'];
  /** Specifies whether the InputField is shown in the Designer. */
  shown: Scalars['Boolean'];
  /** Specifies the type of data the InputField handles. */
  type: InputFieldType;
};

/** Represents a choice for an InputField. */
export type InputFieldChoice = {
  /** The label to display for the choice. */
  label: Scalars['String'];
  /** The value of the choice. */
  value: Scalars['String'];
};

/** An enumeration. */
export enum InputFieldCollection {
  /** keyvaluelist */
  Keyvaluelist = 'KEYVALUELIST',
  /** valuelist */
  Valuelist = 'VALUELIST'
}

/** Represents a Relay Connection to a collection of InputField objects. */
export type InputFieldConnection = {
  __typename?: 'InputFieldConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InputFieldEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InputField>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** Represents an input field for a Component Action. */
export type InputFieldDefinition = {
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: InputMaybe<Scalars['String']>;
  /** Additional notes about the InputField. */
  comments?: InputMaybe<Scalars['String']>;
  /** The default value for the InputField. */
  default?: InputMaybe<Scalars['String']>;
  /** An example valid input for this InputField. */
  example?: InputMaybe<Scalars['String']>;
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: Scalars['String'];
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: InputMaybe<Scalars['String']>;
  /** The name of the InputField. */
  label: Scalars['String'];
  /** Language to use for the Code Field. */
  language?: InputMaybe<Scalars['String']>;
  /** Dictates how possible choices are provided for this InputField. */
  model?: InputMaybe<Array<InputMaybe<InputFieldChoice>>>;
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: InputMaybe<Scalars['String']>;
  /** Specifies whether the InputField is required by the Action. */
  required?: InputMaybe<Scalars['Boolean']>;
  /** Specifies the type of data the InputField handles. */
  type: Scalars['String'];
};

/** A Relay edge to a related InputField object and a cursor for pagination. */
export type InputFieldEdge = {
  __typename?: 'InputFieldEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<InputField>;
};

/** An enumeration. */
export enum InputFieldType {
  /** boolean */
  Boolean = 'BOOLEAN',
  /** code */
  Code = 'CODE',
  /** conditional */
  Conditional = 'CONDITIONAL',
  /** connection */
  Connection = 'CONNECTION',
  /** data */
  Data = 'DATA',
  /** dynamicFieldSelection */
  Dynamicfieldselection = 'DYNAMICFIELDSELECTION',
  /** dynamicObjectSelection */
  Dynamicobjectselection = 'DYNAMICOBJECTSELECTION',
  /** jsonForm */
  Jsonform = 'JSONFORM',
  /** objectFieldMap */
  Objectfieldmap = 'OBJECTFIELDMAP',
  /** objectSelection */
  Objectselection = 'OBJECTSELECTION',
  /** password */
  Password = 'PASSWORD',
  /** string */
  String = 'STRING',
  /** text */
  Text = 'TEXT'
}

export type InputInstanceConfigVariable = {
  /** The key of the Required Config Var of the Integration for which a value is being provided. */
  key: Scalars['String'];
  /** The schedule type for the specified Required Config Var of the Integration. */
  scheduleType?: InputMaybe<Scalars['String']>;
  /** The timezone for the specified Required Config Var of the Integration. */
  timeZone?: InputMaybe<Scalars['String']>;
  /** The value to provide for the specified Required Config Var of the Integration. */
  value?: InputMaybe<Scalars['String']>;
  /** The values for nested inputs of the specified Required Config Var of the Integration. */
  values?: InputMaybe<Scalars['JSONString']>;
};

export type InputInstanceFlowConfig = {
  apiKeys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  flowId: Scalars['ID'];
  /** Content type of the payload for testing this IntegrationFlow associated with the Instance. */
  testContentType?: InputMaybe<Scalars['String']>;
  /** Headers of the request for testing this IntegrationFlow associated with the Instance. */
  testHeaders?: InputMaybe<Scalars['JSONString']>;
  /** Data payload for testing this IntegrationFlow associated with the Instance. */
  testPayload?: InputMaybe<Scalars['String']>;
};

export type InputIntegrationFlow = {
  id: Scalars['ID'];
  /** Content type of the payload for testing this IntegrationFlow. */
  testContentType?: InputMaybe<Scalars['String']>;
  /** Headers of the request for testing this IntegrationFlow. */
  testHeaders?: InputMaybe<Scalars['JSONString']>;
  /** Data payload for testing this IntegrationFlow. */
  testPayload?: InputMaybe<Scalars['String']>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type Instance = Node & {
  __typename?: 'Instance';
  /** Specifies whether the signed-in User can deploy the Instance. */
  allowDeploy?: Maybe<Scalars['Boolean']>;
  /** Specifies whether the signed-in User can remove the Instance. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Instance. */
  allowUpdate: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update config variables for the Instance. */
  allowUpdateConfigVariables?: Maybe<Scalars['Boolean']>;
  /** Describes the state of configuration of this Instance. */
  configState?: Maybe<InstanceConfigState>;
  /** The Instance with which the Config Variable is associated. */
  configVariables: InstanceConfigVariableConnection;
  /** The timestamp at which the object was created. */
  createdAt: Scalars['DateTime'];
  /** The Customer for which the Instance is deployed. */
  customer: Customer;
  /** The specific version of the Instance that is deployed. */
  deployedVersion: Scalars['Int'];
  /** Additional notes about the Instance. */
  description: Scalars['String'];
  /** Specifies whether the Instance is currently enabled and in an executable state. */
  enabled: Scalars['Boolean'];
  /** The Instance for which a specific InstanceFlowConfig is being executed. */
  executionResults: InstanceExecutionResultConnection;
  /** The configuration for the IntegrationFlow associated with the Instance. */
  flowConfigs: InstanceFlowConfigConnection;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Specifies whether the latest execution of this Instance resulted in a failure. */
  inFailedState: Scalars['Boolean'];
  /** The Integration that has been deployed for the Instance. */
  integration: Integration;
  /** Specifies whether the Instance can be deployed through the Marketplace. */
  isCustomerDeployable?: Maybe<Scalars['Boolean']>;
  /** Specifies whether the Instance can be upgraded through the Marketplace. */
  isCustomerUpgradeable?: Maybe<Scalars['Boolean']>;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars['String']>>;
  /** The timestamp at which the Instance was most recently deployed. */
  lastDeployedAt?: Maybe<Scalars['DateTime']>;
  /** The timestamp at which the Instance was most recently executed. */
  lastExecutedAt?: Maybe<Scalars['DateTime']>;
  /** The Instance which created the Log entry. */
  logs: LogConnection;
  /** The Instance that is being monitored by the AlertMonitor. */
  monitors: AlertMonitorConnection;
  /** The name of the Instance. */
  name: Scalars['String'];
  /** Specifies whether a deploy is needed to reflect the newest configuration for this Instance. */
  needsDeploy: Scalars['Boolean'];
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars['Boolean']>;
  /** Specifies whether the Instance has been suspended by Prismatic. */
  systemSuspended: Scalars['Boolean'];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars['DateTime'];
  /** The User Level Config variables for the requesting User on this Instance. */
  userLevelConfigVariables?: Maybe<CustomUserLevelConfigVariableConnection>;
  /** The Instance with which the User Level Config is associated. */
  userLevelConfigs: UserLevelConfigConnection;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceConfigVariablesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  instance?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<Scalars['String']>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceExecutionResultsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  endedAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  endedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  error_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['UUID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  instance_Isnull?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  isTestExecution?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  maxRetryCount?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Gte?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Lte?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  retryCount?: InputMaybe<Scalars['Int']>;
  retryCount_Gte?: InputMaybe<Scalars['Int']>;
  retryCount_Lte?: InputMaybe<Scalars['Int']>;
  retryForExecution_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Gte?: InputMaybe<Scalars['DateTime']>;
  retryNextAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Lte?: InputMaybe<Scalars['DateTime']>;
  retryUniqueRequestId?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  startedAt_Lte?: InputMaybe<Scalars['DateTime']>;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceFlowConfigsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flow_Name?: InputMaybe<Scalars['String']>;
  inFailedState?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceFlowConfigOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceFlowConfigOrder>>>;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceIntegrationArgs = {
  compatibility?: InputMaybe<Scalars['Int']>;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  configVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
  executionResult?: InputMaybe<Scalars['ID']>;
  executionResult_IsTestExecution?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  last?: InputMaybe<Scalars['Int']>;
  message_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LogOrder>;
  severity?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars['DateTime']>;
  timestamp_Lte?: InputMaybe<Scalars['DateTime']>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceMonitorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars['DateTime']>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars['DateTime']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars['Boolean']>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  triggers_Name_Icontains?: InputMaybe<Scalars['String']>;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceUserLevelConfigVariablesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceUserLevelConfigsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAt_Gte?: InputMaybe<Scalars['DateTime']>;
  createdAt_Lte?: InputMaybe<Scalars['DateTime']>;
  first?: InputMaybe<Scalars['Int']>;
  instance?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserLevelConfigOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserLevelConfigOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  updatedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  user?: InputMaybe<Scalars['ID']>;
  user_Email_Icontains?: InputMaybe<Scalars['String']>;
  user_Email_Iexact?: InputMaybe<Scalars['String']>;
  user_ExternalId?: InputMaybe<Scalars['String']>;
  user_Name_Icontains?: InputMaybe<Scalars['String']>;
  user_Name_Iexact?: InputMaybe<Scalars['String']>;
};

/** An enumeration. */
export enum InstanceConfigState {
  FullyConfigured = 'FULLY_CONFIGURED',
  NeedsInstanceConfiguration = 'NEEDS_INSTANCE_CONFIGURATION',
  NeedsUserLevelConfiguration = 'NEEDS_USER_LEVEL_CONFIGURATION'
}

/**
 * Associates specific values to the Required Config Variables specified by an
 * Integration when creating an Instance.
 */
export type InstanceConfigVariable = Node & {
  __typename?: 'InstanceConfigVariable';
  /** Specifies whether the signed-in User can remove the InstanceConfigVariable. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the InstanceConfigVariable. */
  allowUpdate: Scalars['Boolean'];
  /** The Authorize URL of this Config Variable if associated with an OAuth 2.0 Connection. */
  authorizeUrl?: Maybe<Scalars['String']>;
  /** The presigned URL to fetch metadata of the content used to populate the widget, when applicable. */
  contentMetadataUrl?: Maybe<Scalars['String']>;
  /** The presigned URL to download the content used to populate the widget, when applicable. */
  contentUrl?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  inputs?: Maybe<ExpressionConnection>;
  /** The Instance with which the Config Variable is associated. */
  instance: Instance;
  /** The InstanceConfigVariable which relates to the Log entry. */
  logs: LogConnection;
  /** Contains arbitrary metadata about this Config Var. */
  meta?: Maybe<Scalars['JSONString']>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars['DateTime']>;
  /** The Required Config Variable that is satisfied with the assignment of a Config Variable. */
  requiredConfigVariable: RequiredConfigVariable;
  /** The schedule type to show in the UI when the Config Var uses the 'schedule' dataType. */
  scheduleType?: Maybe<InstanceConfigVariableScheduleType>;
  /** Status indicating if this Connection is working as expected or encountering issues. */
  status?: Maybe<InstanceConfigVariableStatus>;
  /** The presigned URL to fetch metadata of the supplemental data that may have been fetched as part of populating the content, when applicable. */
  supplementalDataMetadataUrl?: Maybe<Scalars['String']>;
  /** The presigned URL to download supplemental data that may have been fetched as part of populating the content, when applicable. */
  supplementalDataUrl?: Maybe<Scalars['String']>;
  /** An optional timezone property for when the Config Var uses the 'schedule' dataType. */
  timeZone?: Maybe<Scalars['String']>;
  /** The value for the Required Config Variable that becomes part of the Instance definition. */
  value?: Maybe<Scalars['String']>;
};


/**
 * Associates specific values to the Required Config Variables specified by an
 * Integration when creating an Instance.
 */
export type InstanceConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  visibleToCustomerDeployer?: InputMaybe<Scalars['Boolean']>;
  visibleToOrgDeployer?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Associates specific values to the Required Config Variables specified by an
 * Integration when creating an Instance.
 */
export type InstanceConfigVariableLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  configVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
  executionResult?: InputMaybe<Scalars['ID']>;
  executionResult_IsTestExecution?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  last?: InputMaybe<Scalars['Int']>;
  message_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LogOrder>;
  severity?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars['DateTime']>;
  timestamp_Lte?: InputMaybe<Scalars['DateTime']>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
};

/** Represents a Relay Connection to a collection of InstanceConfigVariable objects. */
export type InstanceConfigVariableConnection = {
  __typename?: 'InstanceConfigVariableConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related InstanceConfigVariable object and a cursor for pagination. */
export type InstanceConfigVariableEdge = {
  __typename?: 'InstanceConfigVariableEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceConfigVariable>;
};

/** An enumeration. */
export enum InstanceConfigVariableScheduleType {
  /** Custom */
  Custom = 'CUSTOM',
  /** Day */
  Day = 'DAY',
  /** Hour */
  Hour = 'HOUR',
  /** Minute */
  Minute = 'MINUTE',
  /** None */
  None = 'NONE',
  /** Week */
  Week = 'WEEK'
}

/** An enumeration. */
export enum InstanceConfigVariableStatus {
  /** active */
  Active = 'ACTIVE',
  /** error */
  Error = 'ERROR',
  /** pending */
  Pending = 'PENDING'
}

/** Represents a Relay Connection to a collection of Instance objects. */
export type InstanceConnection = {
  __typename?: 'InstanceConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Instance>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** Represents snapshots of daily utilization metrics for an Instance. */
export type InstanceDailyUsageMetrics = Node & {
  __typename?: 'InstanceDailyUsageMetrics';
  /** Specifies whether the signed-in User can remove the InstanceDailyUsageMetrics. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the InstanceDailyUsageMetrics. */
  allowUpdate: Scalars['Boolean'];
  /** The number of failed executions of this Instance on the snapshot date. */
  failedExecutionCount: Scalars['BigInt'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Instance for which utilization metrics are being collected. */
  instance: Instance;
  /** The date the utilization metrics snapshot was created. */
  snapshotDate: Scalars['Date'];
  /** The execution spend for this Instance on the snapshot date in MB-secs. */
  spendMbSecs: Scalars['BigInt'];
  /** The number of steps executed for this Instance on the snapshot date. */
  stepCount: Scalars['BigInt'];
  /** The number of successful executions of this Instance on the snapshot date. */
  successfulExecutionCount: Scalars['BigInt'];
};

/** Represents a Relay Connection to a collection of InstanceDailyUsageMetrics objects. */
export type InstanceDailyUsageMetricsConnection = {
  __typename?: 'InstanceDailyUsageMetricsConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceDailyUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceDailyUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related InstanceDailyUsageMetrics object and a cursor for pagination. */
export type InstanceDailyUsageMetricsEdge = {
  __typename?: 'InstanceDailyUsageMetricsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceDailyUsageMetrics>;
};

/** Allows specifying which field and direction to order by. */
export type InstanceDailyUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceDailyUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceDailyUsageMetricsOrderField {
  SnapshotDate = 'SNAPSHOT_DATE'
}

/** A Relay edge to a related Instance object and a cursor for pagination. */
export type InstanceEdge = {
  __typename?: 'InstanceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Instance>;
};

/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResult = Node & {
  __typename?: 'InstanceExecutionResult';
  /** The number of MB of memory allocated by the runtime to execute this Execution. */
  allocatedMemoryMb?: Maybe<Scalars['Int']>;
  /** Specifies whether the signed-in User can remove the InstanceExecutionResult. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the InstanceExecutionResult. */
  allowUpdate: Scalars['Boolean'];
  /** The Execution with a matching Unique Request ID that caused this Execution to be canceled. */
  canceledByExecution?: Maybe<InstanceExecutionResult>;
  /** The timestamp at which execution ended. */
  endedAt?: Maybe<Scalars['DateTime']>;
  /** Any error message that occurred as part of Instance execution. */
  error?: Maybe<Scalars['String']>;
  /** The specific IntegrationFlow that is associated with this Execution. */
  flow?: Maybe<IntegrationFlow>;
  /** The specific InstanceFlowConfig for the Instance being executed. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Instance for which a specific InstanceFlowConfig is being executed. */
  instance?: Maybe<Instance>;
  /** The specific Integration that is associated with this Execution. */
  integration?: Maybe<Integration>;
  /** Specifies whether Execution was created as part of testing. */
  isTestExecution: Scalars['Boolean'];
  /** The specific InstanceExecutionResult that is associated with the Log entry. */
  logs: LogConnection;
  /** The maximum number of times that this Execution may be retried before failing. */
  maxRetryCount?: Maybe<Scalars['Int']>;
  /** The presigned URL to fetch metadata of the request payload that was sent to invoke Instance execution. */
  requestPayloadMetadataUrl: Scalars['String'];
  /** The presigned URL to download the request payload that was sent to invoke Instance execution. */
  requestPayloadUrl: Scalars['String'];
  /** The presigned URL to fetch metadata of the response payload that was received from the Instance execution. */
  responsePayloadMetadataUrl: Scalars['String'];
  /** The presigned URL to download the response payload that was received from the Instance execution. */
  responsePayloadUrl: Scalars['String'];
  /** The Execution for which this Execution is a retry attempt. */
  retryAttempts: InstanceExecutionResultConnection;
  /** The number of times that this Execution has been retried. */
  retryCount?: Maybe<Scalars['Int']>;
  /** The Execution for which this Execution is a retry attempt. */
  retryForExecution?: Maybe<InstanceExecutionResult>;
  /** The timestamp at which the next scheduled retry will occur. */
  retryNextAt?: Maybe<Scalars['DateTime']>;
  /** A Unique Request ID to use for retry request cancellation. */
  retryUniqueRequestId?: Maybe<Scalars['String']>;
  /** The spend for this Execution in MB-secs. */
  spendMbSecs?: Maybe<Scalars['Int']>;
  /** The timestamp at which execution started. */
  startedAt: Scalars['DateTime'];
  /** The number of steps in this Execution. */
  stepCount?: Maybe<Scalars['Int']>;
  /** The InstanceExecutionResult to which the InstanceStepResult is associated. */
  stepResults: InstanceStepResultConnection;
};


/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResultLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  configVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
  executionResult?: InputMaybe<Scalars['ID']>;
  executionResult_IsTestExecution?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  last?: InputMaybe<Scalars['Int']>;
  message_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LogOrder>;
  severity?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars['DateTime']>;
  timestamp_Lte?: InputMaybe<Scalars['DateTime']>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
};


/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResultRetryAttemptsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  endedAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  endedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  error_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['UUID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  instance_Isnull?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  isTestExecution?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  maxRetryCount?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Gte?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Lte?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  retryCount?: InputMaybe<Scalars['Int']>;
  retryCount_Gte?: InputMaybe<Scalars['Int']>;
  retryCount_Lte?: InputMaybe<Scalars['Int']>;
  retryForExecution_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Gte?: InputMaybe<Scalars['DateTime']>;
  retryNextAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Lte?: InputMaybe<Scalars['DateTime']>;
  retryUniqueRequestId?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  startedAt_Lte?: InputMaybe<Scalars['DateTime']>;
};


/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResultStepResultsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  branchName?: InputMaybe<Scalars['String']>;
  displayStepName?: InputMaybe<Scalars['String']>;
  endedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  endedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  first?: InputMaybe<Scalars['Int']>;
  isLoopStep?: InputMaybe<Scalars['Boolean']>;
  isRootResult?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  loopPath?: InputMaybe<Scalars['String']>;
  loopPath_Istartswith?: InputMaybe<Scalars['String']>;
  loopStepIndex?: InputMaybe<Scalars['Int']>;
  loopStepName?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceStepResultOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceStepResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  startedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  stepName?: InputMaybe<Scalars['String']>;
};

/** Represents a Relay Connection to a collection of InstanceExecutionResult objects. */
export type InstanceExecutionResultConnection = {
  __typename?: 'InstanceExecutionResultConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceExecutionResultEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceExecutionResult>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related InstanceExecutionResult object and a cursor for pagination. */
export type InstanceExecutionResultEdge = {
  __typename?: 'InstanceExecutionResultEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceExecutionResult>;
};

/** Allows specifying which field and direction to order by. */
export type InstanceExecutionResultOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceExecutionResultOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceExecutionResultOrderField {
  EndedAt = 'ENDED_AT',
  StartedAt = 'STARTED_AT'
}

/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfig = Node & {
  __typename?: 'InstanceFlowConfig';
  /** Specifies whether the signed-in User can remove the InstanceFlowConfig. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the InstanceFlowConfig. */
  allowUpdate: Scalars['Boolean'];
  /** An optional collection of API Keys any of which, when specified, will be required as a header value in all requests to trigger execution of this IntegrationFlow for the associated Instance. */
  apiKeys?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The specific InstanceFlowConfig for the Instance being executed. */
  executionResults: InstanceExecutionResultConnection;
  /** The IntegrationFlow for which configuration is being specified for the associated Instance. */
  flow: IntegrationFlow;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Specifies whether the latest execution of this InstanceFlowConfig resulted in a failure. */
  inFailedState: Scalars['Boolean'];
  /** The configuration for the IntegrationFlow associated with the Instance. */
  instance: Instance;
  /** The timestamp at which the InstanceFlowConfig was most recently executed. */
  lastExecutedAt?: Maybe<Scalars['DateTime']>;
  /** The IntegrationFlow which created the Log entry. */
  logs: LogConnection;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  monitors: AlertMonitorConnection;
  /** Content type of the payload for testing the IntegrationFlow associated with the Instance. */
  testContentType?: Maybe<Scalars['String']>;
  /** Headers for testing this IntegrationFlow associated with the Instance. */
  testHeaders?: Maybe<Scalars['JSONString']>;
  /** Data payload for testing this IntegrationFlow associated with the Instance. */
  testPayload?: Maybe<Scalars['String']>;
  /** The URL of the endpoint that triggers execution of the InstanceFlowConfig. */
  webhookUrl: Scalars['String'];
};


/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfigExecutionResultsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  endedAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  endedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  error_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['UUID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  instance_Isnull?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  isTestExecution?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  maxRetryCount?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Gte?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Lte?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  retryCount?: InputMaybe<Scalars['Int']>;
  retryCount_Gte?: InputMaybe<Scalars['Int']>;
  retryCount_Lte?: InputMaybe<Scalars['Int']>;
  retryForExecution_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Gte?: InputMaybe<Scalars['DateTime']>;
  retryNextAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Lte?: InputMaybe<Scalars['DateTime']>;
  retryUniqueRequestId?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  startedAt_Lte?: InputMaybe<Scalars['DateTime']>;
};


/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfigLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  configVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
  executionResult?: InputMaybe<Scalars['ID']>;
  executionResult_IsTestExecution?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  last?: InputMaybe<Scalars['Int']>;
  message_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LogOrder>;
  severity?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars['DateTime']>;
  timestamp_Lte?: InputMaybe<Scalars['DateTime']>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfigMonitorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars['DateTime']>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars['DateTime']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars['Boolean']>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  triggers_Name_Icontains?: InputMaybe<Scalars['String']>;
};

/** Represents a Relay Connection to a collection of InstanceFlowConfig objects. */
export type InstanceFlowConfigConnection = {
  __typename?: 'InstanceFlowConfigConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceFlowConfigEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceFlowConfig>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related InstanceFlowConfig object and a cursor for pagination. */
export type InstanceFlowConfigEdge = {
  __typename?: 'InstanceFlowConfigEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceFlowConfig>;
};

/** Allows specifying which field and direction to order by. */
export type InstanceFlowConfigOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceFlowConfigOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceFlowConfigOrderField {
  SortOrder = 'SORT_ORDER'
}

/** Allows specifying which field and direction to order by. */
export type InstanceOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceOrderField {
  Category = 'CATEGORY',
  Customer = 'CUSTOMER',
  Description = 'DESCRIPTION',
  Enabled = 'ENABLED',
  Integration = 'INTEGRATION',
  Name = 'NAME',
  Version = 'VERSION'
}

/**
 * Represents the result of executing a specific step of an Integration as
 * part of an Instance execution.
 */
export type InstanceStepResult = Node & {
  __typename?: 'InstanceStepResult';
  /** Specifies whether the signed-in User can remove the InstanceStepResult. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the InstanceStepResult. */
  allowUpdate: Scalars['Boolean'];
  /** The name of the branch containing the IntegrationAction that generated this result, if any. */
  branchName?: Maybe<Scalars['String']>;
  /** The display name of the IntegrationAction that generated this result. */
  displayStepName?: Maybe<Scalars['String']>;
  /** The timestamp at which execution of the step ended. */
  endedAt?: Maybe<Scalars['DateTime']>;
  /** The InstanceExecutionResult to which the InstanceStepResult is associated. */
  executionResult: InstanceExecutionResult;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Specifies whether the result was generated by a Loop IntegrationAction. */
  isLoopStep: Scalars['Boolean'];
  /** Identifies whether this is a 'root level' result or whether this is contained in a loop. */
  isRootResult: Scalars['Boolean'];
  /** The presigned URL to fetch metadata of the inputs for this specific step if it is a Loop step. */
  loopInputsMetadataUrl?: Maybe<Scalars['String']>;
  /** The presigned URL to download the inputs for this specific step if it is a Loop step. */
  loopInputsUrl?: Maybe<Scalars['String']>;
  /** A string containing a sequence of space-separated 'loopStepName:iterationNumber' tokens that allow this result to be requested based solely on loop positions and iteration numbers */
  loopPath?: Maybe<Scalars['String']>;
  /** The iteration index of the containing Loop IntegrationAction at the time this result was generated, if any. */
  loopStepIndex?: Maybe<Scalars['Int']>;
  /** The name of the IntegrationAction that is the Loop containing the IntegrationAction that generated this result, if any. */
  loopStepName?: Maybe<Scalars['String']>;
  /** The presigned URL to fetch metadata of the result of this specific step of the Instance execution. */
  resultsMetadataUrl: Scalars['String'];
  /** The presigned URL to download the result of this specific step of the Instance execution. */
  resultsUrl: Scalars['String'];
  /** The timestamp at which execution of the step started. */
  startedAt: Scalars['DateTime'];
  /** The name of the IntegrationAction that generated this result. */
  stepName?: Maybe<Scalars['String']>;
};

/** Represents a Relay Connection to a collection of InstanceStepResult objects. */
export type InstanceStepResultConnection = {
  __typename?: 'InstanceStepResultConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceStepResultEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceStepResult>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related InstanceStepResult object and a cursor for pagination. */
export type InstanceStepResultEdge = {
  __typename?: 'InstanceStepResultEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceStepResult>;
};

/** Allows specifying which field and direction to order by. */
export type InstanceStepResultOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceStepResultOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceStepResultOrderField {
  EndedAt = 'ENDED_AT',
  StartedAt = 'STARTED_AT'
}

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type Integration = Node & {
  __typename?: 'Integration';
  /** The Integration to which the IntegrationAction is associated via the IntegrationFlow. */
  actions: IntegrationActionConnection;
  /** Specifies whether the signed-in User can fork the Integration. */
  allowFork: Scalars['Boolean'];
  /** Specifies whether the signed-in User can manage Attachments related to this record. */
  allowManageAttachments?: Maybe<Scalars['Boolean']>;
  /** Specifies whether the signed-in User can publish the Integration. */
  allowPublish: Scalars['Boolean'];
  /** Specifies whether the signed-in User can remove the Integration. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Integration. */
  allowUpdate: Scalars['Boolean'];
  /** A JSON list of objects where each object has a key for name and URL that together describe the Attachment. */
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Specifies the category of the Integration. */
  category?: Maybe<Scalars['String']>;
  /** A JSON string that represents deployment configuration pages. */
  configPages: Scalars['JSONString'];
  /** The timestamp at which the object was created. */
  createdAt: Scalars['DateTime'];
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: Maybe<Customer>;
  /** The YAML that is the declarative definition for the Integration. Suitable for using to re-import the Integration. */
  definition?: Maybe<Scalars['String']>;
  /** Additional notes about the Integration. */
  description?: Maybe<Scalars['String']>;
  /** Rich text documentation to accompany the Integration. */
  documentation?: Maybe<Scalars['String']>;
  /** Content type of the payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestContentType?: Maybe<Scalars['String']>;
  /** A JSON string of key/value pairs that will be sent as headers when testing the endpoint configuration for this Integration. */
  endpointConfigTestHeaders?: Maybe<Scalars['JSONString']>;
  /** Data payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestPayload?: Maybe<Scalars['String']>;
  /** The URL of the endpoint that allows testing the endpoint configuration of the Integration. */
  endpointConfigTestUrl: Scalars['String'];
  /** Specifies whether endpoint URLs for Instances of this Integration are unique to the flow, unique to the Instance, or if all Instances share a URL. */
  endpointType?: Maybe<IntegrationEndpointType>;
  /** The Integration of which the IntegrationFlow is a part. */
  flows: IntegrationFlowConnection;
  /** Specifies whether the Integration definition has changes that have not yet been published. */
  hasUnpublishedChanges: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Integration that has been deployed for the Instance. */
  instances: InstanceConnection;
  /** Specifies whether the Integration can be deployed by the signed-in User. */
  isCustomerDeployable?: Maybe<Scalars['Boolean']>;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars['String']>>;
  /** The timestamp at which this Integration was most recently executed as part of an Instance. */
  lastExecutedAt?: Maybe<Scalars['DateTime']>;
  /** Specifies whether an Integration will be available in the Integration Marketplace and if the Integration is deployable by a Customer User. */
  marketplaceConfiguration: MarketplaceConfiguration;
  /** The Marketplace Tabs available to Customer Users for configuring this Integration. */
  marketplaceTabConfiguration?: Maybe<Array<Scalars['String']>>;
  /** The name of the Integration. */
  name: Scalars['String'];
  /** Specifies an Overview of the Integration to describe its functionality for use in the Integration Marketplace. */
  overview?: Maybe<Scalars['String']>;
  /** Parent Integration this Integration was forked from, if any */
  parent?: Maybe<Integration>;
  /** The name of a Flow in the Integration that will be executed as a preprocessing step prior to any other Flow executions. */
  preprocessFlowName?: Maybe<Scalars['String']>;
  requiredConfigVariables: RequiredConfigVariableConnection;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars['Boolean']>;
  /** Specifies whether an Integration will be available in the Integration Store and if the Integration is deployable by a Customer User. */
  storeConfiguration?: Maybe<IntegrationStoreConfiguration>;
  /** System Instance backing this Integration. */
  systemInstance: Instance;
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  templateConfiguration: IntegrationTemplateConfiguration;
  /** Config Variables that are used for testing during Integration design. */
  testConfigVariables: InstanceConfigVariableConnection;
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  useAsTemplate: Scalars['Boolean'];
  /** Specifies whether this Integration uses User Level Configs. */
  userLevelConfigured: Scalars['Boolean'];
  /** Additional comments about this version. */
  versionComment?: Maybe<Scalars['String']>;
  /** Timestamp of the creation of this version. */
  versionCreatedAt?: Maybe<Scalars['DateTime']>;
  /** User that created this version. */
  versionCreatedBy?: Maybe<User>;
  /** Indicates if the version is available for use. */
  versionIsAvailable: Scalars['Boolean'];
  /** Marked if this record is the latest version of this sequence. */
  versionIsLatest: Scalars['Boolean'];
  /** Sequential number identifying this version. */
  versionNumber: Scalars['Int'];
  /** Sequence of versions of this Integration */
  versionSequence: IntegrationConnection;
  /** Identifier for this version sequence. */
  versionSequenceId?: Maybe<Scalars['UUID']>;
  /** The Versions of the Integration that are available. */
  versions: VersionConnection;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationActionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationDefinitionArgs = {
  useLatestComponentVersions?: InputMaybe<Scalars['Boolean']>;
  version?: InputMaybe<Scalars['Int']>;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationFlowsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationInstancesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  compatibility?: InputMaybe<Scalars['Int']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_ExternalId?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  integration?: InputMaybe<Scalars['ID']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  needsDeploy?: InputMaybe<Scalars['Boolean']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationRequiredConfigVariablesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  dataSource?: InputMaybe<Scalars['ID']>;
  dataType?: InputMaybe<Scalars['String']>;
  dataType_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  first?: InputMaybe<Scalars['Int']>;
  hasDivider?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  key?: InputMaybe<Scalars['String']>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RequiredConfigVariableOrder>;
  orgOnly?: InputMaybe<Scalars['Boolean']>;
  sortBy?: InputMaybe<Array<InputMaybe<RequiredConfigVariableOrder>>>;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationTestConfigVariablesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  instance?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<Scalars['String']>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationVersionSequenceArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  category_Icontains?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasUnpublishedChanges?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  useAsTemplate?: InputMaybe<Scalars['Boolean']>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationVersionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VersionOrder>;
};

/** Represents an association of a Component Action to an Integration. */
export type IntegrationAction = Node & {
  __typename?: 'IntegrationAction';
  /** The specific Component Action that is being associated to the IntegrationFlow. */
  action: Action;
  /** Specifies whether the signed-in User can remove the IntegrationAction. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the IntegrationAction. */
  allowUpdate: Scalars['Boolean'];
  /** A brief description of the IntegrationAction. */
  description: Scalars['String'];
  /** The type of error handling to use when failures occur for this IntegrationAction. */
  errorHandlerType?: Maybe<IntegrationActionErrorHandlerType>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The collection of Expressions that serve as inputs to the IntegrationAction. */
  inputs: ExpressionConnection;
  /** The Integration to which the IntegrationAction is associated via the IntegrationFlow. */
  integration: Integration;
  /** The displayed name of the IntegrationAction. */
  name: Scalars['String'];
  /** Specifies the delay in seconds between retry attempts for failures of this IntegrationAction. */
  retryDelaySeconds?: Maybe<Scalars['Int']>;
  /** Specifies whether to fail the Execution when the final retry attempt fails for this IntegrationAction, or whether to ignore and continue. */
  retryIgnoreFinalError?: Maybe<Scalars['Boolean']>;
  /** Specifies the maximum number of retry attempts that will be performed for failures of this IntegrationAction. */
  retryMaxAttempts?: Maybe<Scalars['Int']>;
  /** Specifies whether to use exponential backoff in scheduling retries for failures of this IntegrationAction. */
  retryUsesExponentialBackoff?: Maybe<Scalars['Boolean']>;
};


/** Represents an association of a Component Action to an Integration. */
export type IntegrationActionInputsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

/** Represents a Relay Connection to a collection of IntegrationAction objects. */
export type IntegrationActionConnection = {
  __typename?: 'IntegrationActionConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationActionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<IntegrationAction>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related IntegrationAction object and a cursor for pagination. */
export type IntegrationActionEdge = {
  __typename?: 'IntegrationActionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<IntegrationAction>;
};

/** An enumeration. */
export enum IntegrationActionErrorHandlerType {
  /** Fail */
  Fail = 'FAIL',
  /** Ignore */
  Ignore = 'IGNORE',
  /** Retry */
  Retry = 'RETRY'
}

/** Represents an integration category. */
export type IntegrationCategory = Node & {
  __typename?: 'IntegrationCategory';
  /** The ID of the object */
  id: Scalars['ID'];
  /** The name of the Integration category. */
  name: Scalars['String'];
};

/** Represents a Relay Connection to a collection of Integration objects. */
export type IntegrationConnection = {
  __typename?: 'IntegrationConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Integration>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related Integration object and a cursor for pagination. */
export type IntegrationEdge = {
  __typename?: 'IntegrationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Integration>;
};

/** An enumeration. */
export enum IntegrationEndpointType {
  /** Flow Specific */
  FlowSpecific = 'FLOW_SPECIFIC',
  /** Instance Specific */
  InstanceSpecific = 'INSTANCE_SPECIFIC',
  /** Shared Instance */
  SharedInstance = 'SHARED_INSTANCE'
}

/**
 * Relates an Integration to a hierarchical structure of Component Actions
 * that define the behavior of one of potentially several workflows that
 * comprise the Integration.
 */
export type IntegrationFlow = Node & {
  __typename?: 'IntegrationFlow';
  /** Specifies whether the signed-in User can remove the IntegrationFlow. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the IntegrationFlow. */
  allowUpdate: Scalars['Boolean'];
  /** Additional notes about the IntegrationFlow. */
  description?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Specifies whether responses to Executions of this IntegrationFlow are synchronous. Responses are asynchronous by default. */
  isSynchronous: Scalars['Boolean'];
  /** The timestamp at which this IntegrationFlow was most recently executed as part of an Instance. */
  lastExecutedAt?: Maybe<Scalars['DateTime']>;
  /** The displayed name of the IntegrationFlow. */
  name: Scalars['String'];
  /** Specifies the delay in minutes between retry attempts of Executions of this IntegrationFlow. */
  retryDelayMinutes: Scalars['Int'];
  /** Specifies the maximum number of retry attempts that will be performed for Executions of this IntegrationFlow. */
  retryMaxAttempts: Scalars['Int'];
  /** Specifies a reference to the data to use as a Unique Request ID for retry request cancellation. */
  retryUniqueRequestIdField?: Maybe<Expression>;
  /** Specifies whether to use exponential backoff in scheduling retries of Executions of this IntegrationFlow. */
  retryUsesExponentialBackoff: Scalars['Boolean'];
  /** The order in which the IntegrationFlow will appear in the UI. */
  sortOrder: Scalars['Int'];
  /** Represents identity across different integration versions. */
  stableId?: Maybe<Scalars['UUID']>;
  /** Content type of the payload for testing this Integration Flow. */
  testContentType?: Maybe<Scalars['String']>;
  /** The Execution Results that were generated during testing. */
  testExecutionResults: InstanceExecutionResultConnection;
  /** Headers of the request for testing this Integration Flow. */
  testHeaders?: Maybe<Scalars['JSONString']>;
  /** Data payload for testing this Integration Flow. */
  testPayload?: Maybe<Scalars['String']>;
  /** The URL of the endpoint that triggers execution of the Integration Flow in the Test Runner. */
  testUrl: Scalars['String'];
  /** The IntegrationAction that is the trigger for the Integration Flow. */
  trigger: IntegrationAction;
};


/**
 * Relates an Integration to a hierarchical structure of Component Actions
 * that define the behavior of one of potentially several workflows that
 * comprise the Integration.
 */
export type IntegrationFlowTestExecutionResultsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  endedAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  endedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  error_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['UUID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  instance_Isnull?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  isTestExecution?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  maxRetryCount?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Gte?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Lte?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  retryCount?: InputMaybe<Scalars['Int']>;
  retryCount_Gte?: InputMaybe<Scalars['Int']>;
  retryCount_Lte?: InputMaybe<Scalars['Int']>;
  retryForExecution_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Gte?: InputMaybe<Scalars['DateTime']>;
  retryNextAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Lte?: InputMaybe<Scalars['DateTime']>;
  retryUniqueRequestId?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  startedAt_Lte?: InputMaybe<Scalars['DateTime']>;
};

/** Represents a Relay Connection to a collection of IntegrationFlow objects. */
export type IntegrationFlowConnection = {
  __typename?: 'IntegrationFlowConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationFlowEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<IntegrationFlow>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related IntegrationFlow object and a cursor for pagination. */
export type IntegrationFlowEdge = {
  __typename?: 'IntegrationFlowEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<IntegrationFlow>;
};

/** Allows specifying which field and direction to order by. */
export type IntegrationOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: IntegrationOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum IntegrationOrderField {
  Category = 'CATEGORY',
  Customer = 'CUSTOMER',
  Description = 'DESCRIPTION',
  Name = 'NAME',
  VersionNumber = 'VERSION_NUMBER'
}

export enum IntegrationStoreConfiguration {
  AvailableAndDeployable = 'AVAILABLE_AND_DEPLOYABLE',
  AvailableNotDeployable = 'AVAILABLE_NOT_DEPLOYABLE',
  NotAvailableInStore = 'NOT_AVAILABLE_IN_STORE'
}

/** An enumeration. */
export enum IntegrationTemplateConfiguration {
  /** Available */
  Available = 'AVAILABLE',
  /** Customer Available */
  CustomerAvailable = 'CUSTOMER_AVAILABLE',
  /** Not Available */
  NotAvailable = 'NOT_AVAILABLE',
  /** Org Available */
  OrgAvailable = 'ORG_AVAILABLE'
}

/** Represents a label. */
export type Label = Node & {
  __typename?: 'Label';
  /** The ID of the object */
  id: Scalars['ID'];
  /** The value of the label. */
  name: Scalars['String'];
};

/**
 * Represents a log entry that was created during a specific Execution of an
 * Instance.
 */
export type Log = Node & {
  __typename?: 'Log';
  /** Specifies whether the signed-in User can remove the Log. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Log. */
  allowUpdate: Scalars['Boolean'];
  /** The InstanceConfigVariable which relates to the Log entry. */
  configVariable?: Maybe<InstanceConfigVariable>;
  /** The specific InstanceExecutionResult that is associated with the Log entry. */
  executionResult?: Maybe<InstanceExecutionResult>;
  /** The specific IntegrationFlow that is associated with the Log entry. */
  flow?: Maybe<IntegrationFlow>;
  /** The IntegrationFlow which created the Log entry. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** Specifies whether the Log was generated as part of the associated Integration's Preprocess Flow. */
  fromPreprocessFlow?: Maybe<Scalars['Boolean']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Instance which created or is related to the Log entry. */
  instance?: Maybe<Instance>;
  /** The specific Integration that is associated with the Log entry. */
  integration?: Maybe<Integration>;
  /** The iteration index of the containing Loop IntegrationAction at the time this Log entry was generated, if any. */
  loopStepIndex?: Maybe<Scalars['Int']>;
  /** The name of the IntegrationAction that is the Loop containing the IntegrationAction that generated this Log entry, if any. */
  loopStepName?: Maybe<Scalars['String']>;
  /** The message body of the Log entry. */
  message: Scalars['String'];
  /** The severity level of the Log entry. */
  severity: LogSeverityLevel;
  /** The name of the IntegrationAction that generated this Log entry. */
  stepName?: Maybe<Scalars['String']>;
  /** The timestamp at which the Log was created. */
  timestamp: Scalars['DateTime'];
  /** The UserLevelConfigVariable which relates to the Log entry. */
  userLevelConfigVariable?: Maybe<UserLevelConfigVariable>;
};

/** Represents a Relay Connection to a collection of Log objects. */
export type LogConnection = {
  __typename?: 'LogConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<LogEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Log>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related Log object and a cursor for pagination. */
export type LogEdge = {
  __typename?: 'LogEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Log>;
};

/** Allows specifying which field and direction to order by. */
export type LogOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: LogOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum LogOrderField {
  ConfigVariable = 'CONFIG_VARIABLE',
  Customer = 'CUSTOMER',
  Flow = 'FLOW',
  FlowConfig = 'FLOW_CONFIG',
  Instance = 'INSTANCE',
  Integration = 'INTEGRATION',
  Message = 'MESSAGE',
  Severity = 'SEVERITY',
  Timestamp = 'TIMESTAMP',
  UserLevelConfigVariable = 'USER_LEVEL_CONFIG_VARIABLE'
}

export type LogSeverity = {
  __typename?: 'LogSeverity';
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
};

/** Indicates the severity level of a log message. */
export enum LogSeverityLevel {
  Debug = 'DEBUG',
  Error = 'ERROR',
  Fatal = 'FATAL',
  Info = 'INFO',
  Metric = 'METRIC',
  Trace = 'TRACE',
  Warn = 'WARN'
}

export type LogSeverityLevelInput = {
  /** The integer value of the log severity level. */
  id: Scalars['Int'];
  /** The description of the log severity level. */
  name: Scalars['String'];
};

export enum MarketplaceConfiguration {
  AvailableAndDeployable = 'AVAILABLE_AND_DEPLOYABLE',
  AvailableNotDeployable = 'AVAILABLE_NOT_DEPLOYABLE',
  NotAvailableInMarketplace = 'NOT_AVAILABLE_IN_MARKETPLACE'
}

export enum MediaType {
  Attachment = 'ATTACHMENT',
  Avatar = 'AVATAR'
}

/** An object with an ID */
export type Node = {
  /** The ID of the object */
  id: Scalars['ID'];
};

/**
 * Represents a permission that has been granted to a specified object, either
 * directly or via a Role.
 */
export type ObjectPermissionGrant = Node & {
  __typename?: 'ObjectPermissionGrant';
  /** Specifies whether the signed-in User can remove the ObjectPermissionGrant. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the ObjectPermissionGrant. */
  allowUpdate: Scalars['Boolean'];
  /** The Role through which the Permission is granted, if applicable. */
  grantedByRole?: Maybe<Role>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** A reference to the object for which the Permission is granted. */
  obj: Scalars['UUID'];
  /** The Permission being granted. */
  permission: Permission;
  /** The User for which the Permission is granted. */
  user: User;
};

/** Represents a Relay Connection to a collection of ObjectPermissionGrant objects. */
export type ObjectPermissionGrantConnection = {
  __typename?: 'ObjectPermissionGrantConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ObjectPermissionGrantEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ObjectPermissionGrant>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related ObjectPermissionGrant object and a cursor for pagination. */
export type ObjectPermissionGrantEdge = {
  __typename?: 'ObjectPermissionGrantEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<ObjectPermissionGrant>;
};

/** Allows specifying which field and direction to order by. */
export type ObjectPermissionGrantOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ObjectPermissionGrantOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ObjectPermissionGrantOrderField {
  Permission = 'PERMISSION'
}

/** Represents the supported sort order directions. */
export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Represents snapshots of daily utilization metrics for an Organization. */
export type OrgDailyUsageMetrics = Node & {
  __typename?: 'OrgDailyUsageMetrics';
  /** Specifies whether the signed-in User can remove the OrgDailyUsageMetrics. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the OrgDailyUsageMetrics. */
  allowUpdate: Scalars['Boolean'];
  /** The total number of failed Instance executions on the snapshot date. */
  failedExecutionCount: Scalars['BigInt'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The date the utilization metrics snapshot was created. */
  snapshotDate: Scalars['Date'];
  /** The total execution spend on the snapshot date in MB-secs. */
  spendMbSecs: Scalars['BigInt'];
  /** The total number of steps executed on the snapshot date. */
  stepCount: Scalars['BigInt'];
  /** The total number of successful Instance executions on the snapshot date. */
  successfulExecutionCount: Scalars['BigInt'];
};

/** Represents a Relay Connection to a collection of OrgDailyUsageMetrics objects. */
export type OrgDailyUsageMetricsConnection = {
  __typename?: 'OrgDailyUsageMetricsConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<OrgDailyUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<OrgDailyUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related OrgDailyUsageMetrics object and a cursor for pagination. */
export type OrgDailyUsageMetricsEdge = {
  __typename?: 'OrgDailyUsageMetricsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<OrgDailyUsageMetrics>;
};

/** Allows specifying which field and direction to order by. */
export type OrgDailyUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: OrgDailyUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum OrgDailyUsageMetricsOrderField {
  SnapshotDate = 'SNAPSHOT_DATE'
}

/** Represents snapshots of total utilization metrics for the Organization. */
export type OrgTotalUsageMetrics = Node & {
  __typename?: 'OrgTotalUsageMetrics';
  /** Specifies whether the signed-in User can remove the OrgTotalUsageMetrics. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the OrgTotalUsageMetrics. */
  allowUpdate: Scalars['Boolean'];
  /** The total number of bytes of blob storage currently used. */
  blobBytesStored: Scalars['BigInt'];
  /** The total number of Customers that currently exist. */
  customerCount: Scalars['Int'];
  /** The total number of Instances that are deployed. */
  deployedInstanceCount: Scalars['Int'];
  /** The total number of unique Integrations that are deployed. */
  deployedUniqueIntegrationCount: Scalars['Int'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The total number of Integrations that currently exist. */
  integrationCount: Scalars['Int'];
  /** The time the utilization metrics snapshot was created. */
  snapshotTime: Scalars['DateTime'];
  /** The total number of Users that currently exist. */
  userCount: Scalars['Int'];
};

/** Represents a Relay Connection to a collection of OrgTotalUsageMetrics objects. */
export type OrgTotalUsageMetricsConnection = {
  __typename?: 'OrgTotalUsageMetricsConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<OrgTotalUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<OrgTotalUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related OrgTotalUsageMetrics object and a cursor for pagination. */
export type OrgTotalUsageMetricsEdge = {
  __typename?: 'OrgTotalUsageMetricsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<OrgTotalUsageMetrics>;
};

/** Allows specifying which field and direction to order by. */
export type OrgTotalUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: OrgTotalUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum OrgTotalUsageMetricsOrderField {
  SnapshotTime = 'SNAPSHOT_TIME'
}

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type Organization = Node & {
  __typename?: 'Organization';
  /** Specifies whether the signed-in User can add an AlertGroup to the Organization. */
  allowAddAlertGroup: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add an AlertWebhook to the Organization. */
  allowAddAlertWebhook: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a Credential to the Organization. */
  allowAddCredential: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a Customer to the Organization. */
  allowAddCustomer: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add an External Log stream to the Organization. */
  allowAddExternalLogStream: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add an Integration to the Organization. */
  allowAddIntegration: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a Signing Key to the Organization. */
  allowAddSigningKey: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a User to the Organization. */
  allowAddUser: Scalars['Boolean'];
  /** Specifies whether the signed-in User's Organization has access to legacy Credentials. */
  allowConfigureCredentials: Scalars['Boolean'];
  /** Specifies whether this Plan allows configuration of Embedded for the Organization. */
  allowConfigureEmbedded: Scalars['Boolean'];
  /** Specifies whether this Plan allows configuration of External Log Streams for the Organization. */
  allowConfigureExternalLogStreams: Scalars['Boolean'];
  /** Specifies whether the signed-in User can configure Themes for the Organization. */
  allowConfigureThemes: Scalars['Boolean'];
  /** Specifies whether this Plan allows configuration of a Custom Theme for the Organization. */
  allowCustomTheme: Scalars['Boolean'];
  /** Specifies whether this Plan allows using the Embedded Designer the Organization. */
  allowEmbeddedDesigner: Scalars['Boolean'];
  /** Specifies whether Instances may be enabled based on the utilization allowed by the current Plan. */
  allowEnableInstance: Scalars['Boolean'];
  /** Specifies whether Instances may be executed based on the utilization allowed by the current Plan. */
  allowExecuteInstance: Scalars['Boolean'];
  /** Specifies whether the current Plan allows configuration for automatic retry of Instance executions. */
  allowExecutionRetryConfig: Scalars['Boolean'];
  /** Specifies whether the signed-in User can add a Component to the Organization. */
  allowPublishComponent: Scalars['Boolean'];
  /** Specifies whether the signed-in User can remove the Organization. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Organization. */
  allowUpdate: Scalars['Boolean'];
  /** Specifies whether this Plan allows for creating User Level Configured Instances. */
  allowUserLevelConfig: Scalars['Boolean'];
  /** Specifies whether the signed-in User can view Billing information for the Organization. */
  allowViewBilling: Scalars['Boolean'];
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** The Components that belong to the Organization. */
  components: ComponentConnection;
  /** The Organization the Credential belongs to, if any. If NULL then Customer will be specified. */
  credentials: CredentialConnection;
  /** Plan the Organization is subscribed to; set once payment is confirmed. */
  currentPlan: Scalars['String'];
  /** The Organization to which the Customer belongs. */
  customers: CustomerConnection;
  featureFlags?: Maybe<Scalars['JSONString']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Integrations that belong to the Organization. */
  integrations: IntegrationConnection;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars['String']>>;
  /** Display name of the Organization's Marketplace. */
  marketplaceName: Scalars['String'];
  /** The unique name of the Organization. */
  name: Scalars['String'];
  /** Specifies whether the Organization execution utilization has exceeded the Plan's limits. */
  overExecutionLimit: Scalars['Boolean'];
  /** Indicates if the Organization is overdue on payment */
  overdue: Scalars['Boolean'];
  signingKeys: OrganizationSigningKeyConnection;
  /** Specifies whether the Organization's account has been suspended by Prismatic. */
  systemSuspended: Scalars['Boolean'];
  /** The Theme associated with an Organization */
  theme?: Maybe<Theme>;
  /** The Organization that the User belongs to, if any. If this is NULL then Customer will be specified. */
  users: UserConnection;
  /** Specifies whether to use the Billing Portal based on the Organization's current Plan. */
  usesBillingPortal: Scalars['Boolean'];
};


/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationComponentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars['Boolean']>;
  searchTerms_Fulltext?: InputMaybe<Scalars['String']>;
  searchTerms_Icontains?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationCredentialsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorizationMethod_Key?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CredentialOrder>;
  readyForUse?: InputMaybe<Scalars['Boolean']>;
  sortBy?: InputMaybe<Array<InputMaybe<CredentialOrder>>>;
};


/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationCustomersArgs = {
  after?: InputMaybe<Scalars['String']>;
  allowEmbeddedDesigner?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  externalId_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  name_Istartswith?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CustomerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerOrder>>>;
};


/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationIntegrationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  category_Icontains?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasUnpublishedChanges?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  useAsTemplate?: InputMaybe<Scalars['Boolean']>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationSigningKeysArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  email_Icontains?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  externalId_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
};

/**
 * Represents an Organization's Signing Keys which are used to allow verification
 * of sessions from external systems.
 */
export type OrganizationSigningKey = Node & {
  __typename?: 'OrganizationSigningKey';
  /** Specifies whether the signed-in User can remove the OrganizationSigningKey. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the OrganizationSigningKey. */
  allowUpdate: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** Indicates if the public key was imported (as opposed to generated in Prismatic) */
  imported: Scalars['Boolean'];
  /** The timestamp at which the Signing Key was issued. */
  issuedAt: Scalars['DateTime'];
  /** Preview of Private Key of the Signing Keypair. */
  privateKeyPreview: Scalars['String'];
  /** Public key of the Signing Keypair. */
  publicKey: Scalars['String'];
};

/** Represents a Relay Connection to a collection of OrganizationSigningKey objects. */
export type OrganizationSigningKeyConnection = {
  __typename?: 'OrganizationSigningKeyConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<OrganizationSigningKeyEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<OrganizationSigningKey>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related OrganizationSigningKey object and a cursor for pagination. */
export type OrganizationSigningKeyEdge = {
  __typename?: 'OrganizationSigningKeyEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<OrganizationSigningKey>;
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

/**
 * Represents an object permission, which grants some access to a specific
 * user relative to a specific object.
 */
export type Permission = Node & {
  __typename?: 'Permission';
  /** Specifies whether the signed-in User can remove the Permission. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Permission. */
  allowUpdate: Scalars['Boolean'];
  /** Description of the Permission. */
  description: Scalars['String'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** Name of the Permission. */
  name: Scalars['String'];
  /** The type of object that the Permission is associated with. */
  objType: AuthObjectType;
  /** A unique string identity value. */
  tag: Scalars['String'];
};

/** Represents a Relay Connection to a collection of Permission objects. */
export type PermissionConnection = {
  __typename?: 'PermissionConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<PermissionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Permission>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related Permission object and a cursor for pagination. */
export type PermissionEdge = {
  __typename?: 'PermissionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<Permission>;
};

/** Allows specifying which field and direction to order by. */
export type PermissionOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: PermissionOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum PermissionOrderField {
  Name = 'NAME'
}

export type PublishComponentInput = {
  /** A list of Component Actions. */
  actions?: InputMaybe<Array<InputMaybe<ActionDefinitionInput>>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Comment about changes in this Publish. */
  comment?: InputMaybe<Scalars['String']>;
  /** A list of Component Connections. */
  connections?: InputMaybe<Array<InputMaybe<ConnectionDefinitionInput>>>;
  /** The Customer the Component belongs to, if any. If this is NULL then the Component belongs to the Organization. */
  customer?: InputMaybe<Scalars['ID']>;
  /** A list of Component Data Sources. */
  dataSources?: InputMaybe<Array<InputMaybe<DataSourceDefinitionInput>>>;
  /** The Component definition. */
  definition: ComponentDefinitionInput;
  /** A list of Component Triggers. */
  triggers?: InputMaybe<Array<InputMaybe<TriggerDefinitionInput>>>;
};

export type PublishComponentPayload = {
  __typename?: 'PublishComponentPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  publishResult?: Maybe<PublishComponentResult>;
};

export type PublishComponentResult = {
  __typename?: 'PublishComponentResult';
  component?: Maybe<Component>;
  connectionIconUploadUrls?: Maybe<Array<Maybe<ConnectionIconUploadUrl>>>;
  iconUploadUrl?: Maybe<Scalars['String']>;
  packageUploadUrl?: Maybe<Scalars['String']>;
};

export type PublishIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Comment about changes in this Publish. */
  comment?: InputMaybe<Scalars['String']>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type PublishIntegrationPayload = {
  __typename?: 'PublishIntegrationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type ReplayExecutionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the InstanceExecutionResult to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type ReplayExecutionPayload = {
  __typename?: 'ReplayExecutionPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instanceExecutionResult?: Maybe<InstanceExecutionResult>;
};

export type RequestOAuth2CredentialAuthorizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The email of the recipient who will complete the OAuth2 authorization request. */
  email?: InputMaybe<Scalars['String']>;
  /** The ID of the Credential to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The message that will be sent to the recipient of the email. */
  message?: InputMaybe<Scalars['String']>;
};

export type RequestOAuth2CredentialAuthorizationPayload = {
  __typename?: 'RequestOAuth2CredentialAuthorizationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

/** Represents a Required Config Variable (with optional default value) associated with an Integration. */
export type RequiredConfigVariable = Node & {
  __typename?: 'RequiredConfigVariable';
  /** Specifies whether the signed-in User can remove the RequiredConfigVariable. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the RequiredConfigVariable. */
  allowUpdate: Scalars['Boolean'];
  /** The language to use in the code editor UI when the Required Config Var uses the 'code' dataType. */
  codeLanguage?: Maybe<RequiredConfigVariableCodeLanguage>;
  /** The type of collection, if the value is meant to represent a collection of values for this RequiredConfigVariable. */
  collectionType?: Maybe<RequiredConfigVariableCollectionType>;
  /** The Connection type used by this Required Config Variable. */
  connection?: Maybe<Connection>;
  /** The Required Config Var for which the Authorization Method is a valid type of Credential. */
  credentialTypes: RequiredConfigVariableCredentialTypeConnection;
  /** The Component Data Source used by this Required Config Variable. */
  dataSource?: Maybe<Action>;
  /** The intended datatype of the Required Config Var, used to choose an appropriate UI. */
  dataType: RequiredConfigVariableDataType;
  /** The default value for the Required Config Variable if none is specified on the Instance. */
  defaultValue?: Maybe<Scalars['String']>;
  /** Additional notes about the Required Config Var. */
  description?: Maybe<Scalars['String']>;
  /** This field has been deprecated. */
  hasDivider: Scalars['Boolean'];
  /** The header text that will appear in the UI above the Required Config Variable fields. */
  header?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  inputs?: Maybe<ExpressionConnection>;
  integration: Integration;
  /** The Key for the Required Config Variable. Referred to as 'Name' in the UI. */
  key: Scalars['String'];
  /** Contains arbitrary metadata about this Required Config Var. */
  meta?: Maybe<Scalars['JSONString']>;
  /** Specifies whether the Required Config Variable is only viewable by Organization Users. */
  orgOnly?: Maybe<Scalars['Boolean']>;
  /** The valid choices when the Required Config Var uses the 'picklist' dataType. */
  pickList?: Maybe<Array<Scalars['String']>>;
  /** The schedule type to show in the UI when the Required Config Var uses the 'schedule' dataType. */
  scheduleType?: Maybe<RequiredConfigVariableScheduleType>;
  /** The UI location in which this Required Config Var will appear relative to the other Required Config Vars for the Integration. */
  sortOrder?: Maybe<Scalars['Int']>;
  /** Represents identity across different Required Config Variable versions. */
  stableId?: Maybe<Scalars['UUID']>;
  /** An optional timezone property for when the Required Config Var uses the 'schedule' dataType. */
  timeZone?: Maybe<Scalars['String']>;
  /** Specifies whether this Required Config Variable uses values from User Level Configs. */
  userLevelConfigured: Scalars['Boolean'];
};


/** Represents a Required Config Variable (with optional default value) associated with an Integration. */
export type RequiredConfigVariableCredentialTypesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/** Represents a Required Config Variable (with optional default value) associated with an Integration. */
export type RequiredConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  visibleToCustomerDeployer?: InputMaybe<Scalars['Boolean']>;
  visibleToOrgDeployer?: InputMaybe<Scalars['Boolean']>;
};

/** An enumeration. */
export enum RequiredConfigVariableCodeLanguage {
  /** Html */
  Html = 'HTML',
  /** Json */
  Json = 'JSON',
  /** Xml */
  Xml = 'XML'
}

/** An enumeration. */
export enum RequiredConfigVariableCollectionType {
  /** Keyvaluelist */
  Keyvaluelist = 'KEYVALUELIST',
  /** Valuelist */
  Valuelist = 'VALUELIST'
}

/** Represents a Relay Connection to a collection of RequiredConfigVariable objects. */
export type RequiredConfigVariableConnection = {
  __typename?: 'RequiredConfigVariableConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<RequiredConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<RequiredConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** Represents a valid Credential Type for a Required Config Variable. */
export type RequiredConfigVariableCredentialType = Node & {
  __typename?: 'RequiredConfigVariableCredentialType';
  /** Specifies whether the signed-in User can remove the RequiredConfigVariableCredentialType. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the RequiredConfigVariableCredentialType. */
  allowUpdate: Scalars['Boolean'];
  /** The Authorization Method that represents a valid Credential type for the Required Config Var. */
  authorizationMethod: AuthorizationMethod;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Required Config Var for which the Authorization Method is a valid type of Credential. */
  requiredConfigVariable: RequiredConfigVariable;
};

/** Represents a Relay Connection to a collection of RequiredConfigVariableCredentialType objects. */
export type RequiredConfigVariableCredentialTypeConnection = {
  __typename?: 'RequiredConfigVariableCredentialTypeConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<RequiredConfigVariableCredentialTypeEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<RequiredConfigVariableCredentialType>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related RequiredConfigVariableCredentialType object and a cursor for pagination. */
export type RequiredConfigVariableCredentialTypeEdge = {
  __typename?: 'RequiredConfigVariableCredentialTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<RequiredConfigVariableCredentialType>;
};

/** An enumeration. */
export enum RequiredConfigVariableDataType {
  /** Boolean */
  Boolean = 'BOOLEAN',
  /** Code */
  Code = 'CODE',
  /** Connection */
  Connection = 'CONNECTION',
  /** Credential */
  Credential = 'CREDENTIAL',
  /** Date */
  Date = 'DATE',
  /** Jsonform */
  Jsonform = 'JSONFORM',
  /** Number */
  Number = 'NUMBER',
  /** Objectfieldmap */
  Objectfieldmap = 'OBJECTFIELDMAP',
  /** Objectselection */
  Objectselection = 'OBJECTSELECTION',
  /** Picklist */
  Picklist = 'PICKLIST',
  /** Schedule */
  Schedule = 'SCHEDULE',
  /** String */
  String = 'STRING',
  /** Timestamp */
  Timestamp = 'TIMESTAMP'
}

/** A Relay edge to a related RequiredConfigVariable object and a cursor for pagination. */
export type RequiredConfigVariableEdge = {
  __typename?: 'RequiredConfigVariableEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<RequiredConfigVariable>;
};

/** Allows specifying which field and direction to order by. */
export type RequiredConfigVariableOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: RequiredConfigVariableOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum RequiredConfigVariableOrderField {
  SortOrder = 'SORT_ORDER'
}

/** An enumeration. */
export enum RequiredConfigVariableScheduleType {
  /** Custom */
  Custom = 'CUSTOM',
  /** Day */
  Day = 'DAY',
  /** Hour */
  Hour = 'HOUR',
  /** Minute */
  Minute = 'MINUTE',
  /** None */
  None = 'NONE',
  /** Week */
  Week = 'WEEK'
}

/**
 * Represents an object role, which is just a collection of object permissions
 * that pertain to a specific object for a specific user.
 */
export type Role = Node & {
  __typename?: 'Role';
  /** Specifies whether the signed-in User can remove the Role. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Role. */
  allowUpdate: Scalars['Boolean'];
  /** Description of the Role. */
  description: Scalars['String'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** An integer that specifies the level of privilege with respect to other Roles. */
  level: Scalars['Int'];
  /** The name of the Role. Must be unique within the context of the AuthObjectType. */
  name: Scalars['String'];
  /** The type of object that the Role is associated with. */
  objType: AuthObjectType;
  /** List of Permissions that the Role provides. */
  permissions: PermissionConnection;
};


/**
 * Represents an object role, which is just a collection of object permissions
 * that pertain to a specific object for a specific user.
 */
export type RolePermissionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  objType?: InputMaybe<Scalars['ID']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PermissionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<PermissionOrder>>>;
};

export type RootMutation = {
  __typename?: 'RootMutation';
  /**
   *
   *     Administers a Permission to an object for the specified User.
   *
   *
   * Access is not permitted.
   */
  administerObjectPermission?: Maybe<AdministerObjectPermissionPayload>;
  /**
   *
   *     Updates all Instances that reference the specified Integration to the
   *     latest published version of the specified Integration. If the Instances
   *     are deployed, it will re-deploy them as necessary.
   *     Returns an instance of the latest version of the specified Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  bulkUpdateInstancesToLatestIntegrationVersion?: Maybe<BulkUpdateInstancesToLatestIntegrationVersionPayload>;
  /**
   *
   *     Allows the signed-in User to change their password.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when a value for 'customer' does not exist on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when a value for 'customer' exists on the object.
   *     4. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when a value for 'customer' exists on the object.
   */
  changePassword?: Maybe<ChangePasswordPayload>;
  /**
   *
   *     Allows clearing a triggered AlertMonitor.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances].
   */
  clearAlertMonitor?: Maybe<ClearAlertMonitorPayload>;
  /**
   *     Creates a new AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  createAlertGroup?: Maybe<CreateAlertGroupPayload>;
  /**
   *     Creates a new AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  createAlertMonitor?: Maybe<CreateAlertMonitorPayload>;
  /**
   *     Creates a new AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  createAlertWebhook?: Maybe<CreateAlertWebhookPayload>;
  /**
   *     Creates a new Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   */
  createCustomer?: Maybe<CreateCustomerPayload>;
  /**
   *
   *     Creates a Credential for the specified Customer.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_edit] when 'customer' is provided in the access function context.
   */
  createCustomerCredential?: Maybe<CreateCustomerCredentialPayload>;
  /**
   *
   *     Creates a User for the specified Customer.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_admin_users] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when 'customer' is provided in the access function context.
   */
  createCustomerUser?: Maybe<CreateCustomerUserPayload>;
  /**
   *     Creates a new ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  createExternalLogStream?: Maybe<CreateExternalLogStreamPayload>;
  /**
   *     Creates a new Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_admin_manage_instances, customer_manage_marketplace_integrations] when 'customer' is provided in the access function context.
   */
  createInstance?: Maybe<CreateInstancePayload>;
  /**
   *     Creates a new Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when a value for 'customer.allow_embedded_designer' is provided in the access function context and equals 'True'.
   */
  createIntegration?: Maybe<CreateIntegrationPayload>;
  /**
   *
   *     Creates a Credential for the Organization of the signed-in User.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_edit] when 'customer' is provided in the access function context.
   */
  createOrganizationCredential?: Maybe<CreateOrganizationCredentialPayload>;
  /**
   *
   *     Creates a Signing Key for the Organization of the signed-in User.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  createOrganizationSigningKey?: Maybe<CreateOrganizationSigningKeyPayload>;
  /**
   *
   *     Creates a User for the Organization of the signed-in User.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_admin_users] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when 'customer' is provided in the access function context.
   */
  createOrganizationUser?: Maybe<CreateOrganizationUserPayload>;
  /**
   *     Removes the specified AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  deleteAlertGroup?: Maybe<DeleteAlertGroupPayload>;
  /**
   *     Removes the specified AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   */
  deleteAlertMonitor?: Maybe<DeleteAlertMonitorPayload>;
  /**
   *     Removes the specified AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  deleteAlertWebhook?: Maybe<DeleteAlertWebhookPayload>;
  /**
   *     Removes the specified Component object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_components].
   *     2. The signed-in User has any of the following permissions for any version of the object: [component_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_component_permissions, customer_manage_components, customer_view_components].
   */
  deleteComponent?: Maybe<DeleteComponentPayload>;
  /**
   *     Removes the specified Credential object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_edit] when a value for 'customer' exists on the object.
   */
  deleteCredential?: Maybe<DeleteCredentialPayload>;
  /**
   *     Removes the specified Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_remove].
   */
  deleteCustomer?: Maybe<DeleteCustomerPayload>;
  /**
   *     Removes the specified ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  deleteExternalLogStream?: Maybe<DeleteExternalLogStreamPayload>;
  /**
   *     Removes the specified Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   */
  deleteInstance?: Maybe<DeleteInstancePayload>;
  /**
   *     Removes the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  deleteIntegration?: Maybe<DeleteIntegrationPayload>;
  /**
   *     Removes the specified Organization object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_superuser].
   */
  deleteOrganization?: Maybe<DeleteOrganizationPayload>;
  /**
   *
   *     Deletes the specified Signing Key.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  deleteOrganizationSigningKey?: Maybe<DeleteOrganizationSigningKeyPayload>;
  /**
   *     Removes the specified User object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when the specified object is not the signed-in User and a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when the specified object is not the signed-in User and a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when the specified object is not the signed-in User and a value for 'customer' exists on the object.
   */
  deleteUser?: Maybe<DeleteUserPayload>;
  /**
   *     Removes the specified UserLevelConfig object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The specified object is the signed-in User.
   */
  deleteUserLevelConfig?: Maybe<DeleteUserLevelConfigPayload>;
  /**
   *
   *     Deploys an Instance.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   */
  deployInstance?: Maybe<DeployInstancePayload>;
  /**
   *
   *     Disconnect the specified Connection.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   */
  disconnectConnection?: Maybe<DisconnectConnectionPayload>;
  /**
   *
   *     Disconnect the specified User Level Connection.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The specified object is the signed-in User.
   */
  disconnectUserLevelConnection?: Maybe<DisconnectUserLevelConnectionPayload>;
  /**
   *
   *     Populates content for relevant widgets on the specified configuration
   *     wizard page of the Integration that is associated with the specified
   *     Instance.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   *     6. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations] when a value for 'integration.user_level_configured' exists on the object and equals 'True'.
   */
  fetchConfigWizardPageContent?: Maybe<FetchConfigWizardPageContentPayload>;
  /**
   *
   *     Populates content for a single Data Source in the context of the specified
   *     Instance.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  fetchDataSourceContent?: Maybe<FetchDataSourceContentPayload>;
  /**
   *
   *     Forks an Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when a value for 'customer.allow_embedded_designer' is provided in the access function context and equals 'True'.
   */
  forkIntegration?: Maybe<ForkIntegrationPayload>;
  /**
   *
   *     Import an Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  importIntegration?: Maybe<ImportIntegrationPayload>;
  /**
   *     Creates a new OrganizationSigningKey object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  importOrganizationSigningKey?: Maybe<ImportOrganizationSigningKeyPayload>;
  /**
   *
   *     Publishes a Component.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_components].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_components] when 'customer' is provided in the access function context.
   */
  publishComponent?: Maybe<PublishComponentPayload>;
  /**
   *
   *     Publishes an Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when 'customer' is provided in the access function context.
   */
  publishIntegration?: Maybe<PublishIntegrationPayload>;
  /**
   *
   *     Replays an existing instance execution.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   */
  replayExecution?: Maybe<ReplayExecutionPayload>;
  /**
   *
   *     Sends an email that requests the recipient to complete the OAuth2 flow for
   *     the specified Credential.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_edit] when a value for 'customer' exists on the object.
   */
  requestOAuth2CredentialAuthorization?: Maybe<RequestOAuth2CredentialAuthorizationPayload>;
  /**
   *
   *     Initiates execution of an InstanceFlowConfig for the purposes of testing.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   */
  testInstanceFlowConfig?: Maybe<TestInstanceFlowConfigPayload>;
  /**
   *
   *     Initiates an execution for testing the endpoint configuration of the specified Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  testIntegrationEndpointConfig?: Maybe<TestIntegrationEndpointConfigPayload>;
  /**
   *
   *     Initiates execution of an IntegrationFlow for the purposes of testing.
   *
   *
   * Access is not permitted.
   */
  testIntegrationFlow?: Maybe<TestIntegrationFlowPayload>;
  /**
   *     Updates the specified AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  updateAlertGroup?: Maybe<UpdateAlertGroupPayload>;
  /**
   *     Updates the specified AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances].
   */
  updateAlertMonitor?: Maybe<UpdateAlertMonitorPayload>;
  /**
   *     Updates the specified AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  updateAlertWebhook?: Maybe<UpdateAlertWebhookPayload>;
  /**
   *
   *     Users should not be able to actually update a component,
   *     but will use this mutation to update the "starred" status
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'public' attribute equals: True.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_component_permissions, org_manage_components, org_view_components].
   *     3. The signed-in User has any of the following permissions for any version of the object: [component_view, component_edit, component_remove, component_admin_permissions, component_publish_new_version].
   *     4. The signed-in User has any of the following permissions for the associated Customer: [customer_view_org_components].
   */
  updateComponent?: Maybe<UpdateComponentPayload>;
  /**
   *     Updates the specified Credential object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_edit] when a value for 'customer' exists on the object.
   */
  updateCredential?: Maybe<UpdateCredentialPayload>;
  /**
   *     Updates the specified Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_edit].
   */
  updateCustomer?: Maybe<UpdateCustomerPayload>;
  /**
   *     Updates the specified ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  updateExternalLogStream?: Maybe<UpdateExternalLogStreamPayload>;
  /**
   *     Updates the specified Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  updateInstance?: Maybe<UpdateInstancePayload>;
  /**
   *
   *     Update one or more Instance config variables.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   *     6. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations] when a value for 'integration.user_level_configured' exists on the object and equals 'True'.
   */
  updateInstanceConfigVariables?: Maybe<UpdateInstanceConfigVariablesPayload>;
  /**
   *     Updates the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateIntegration?: Maybe<UpdateIntegrationPayload>;
  /**
   *
   *     Updates the configuration of an Integration Version for use in the Integration Marketplace.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateIntegrationMarketplaceConfiguration?: Maybe<UpdateIntegrationMarketplaceConfigurationPayload>;
  /**
   *
   *     Updates the availability of an Integration version.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateIntegrationVersionAvailability?: Maybe<UpdateIntegrationVersionAvailabilityPayload>;
  /**
   *
   *     Update OAuth2 Connection properties for a given Instance Config Variable.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   */
  updateOAuth2Connection?: Maybe<UpdateOAuth2ConnectionPayload>;
  /**
   *     Updates the specified Organization object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  updateOrganization?: Maybe<UpdateOrganizationPayload>;
  /**
   *
   *     Updates an Organizations Theme.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  updateTheme?: Maybe<UpdateThemePayload>;
  /**
   *     Updates the specified User object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when a value for 'customer' does not exist on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when a value for 'customer' exists on the object.
   *     4. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when a value for 'customer' exists on the object.
   */
  updateUser?: Maybe<UpdateUserPayload>;
};


export type RootMutationAdministerObjectPermissionArgs = {
  input: AdministerObjectPermissionInput;
};


export type RootMutationBulkUpdateInstancesToLatestIntegrationVersionArgs = {
  input: BulkUpdateInstancesToLatestIntegrationVersionInput;
};


export type RootMutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type RootMutationClearAlertMonitorArgs = {
  input: ClearAlertMonitorInput;
};


export type RootMutationCreateAlertGroupArgs = {
  input: CreateAlertGroupInput;
};


export type RootMutationCreateAlertMonitorArgs = {
  input: CreateAlertMonitorInput;
};


export type RootMutationCreateAlertWebhookArgs = {
  input: CreateAlertWebhookInput;
};


export type RootMutationCreateCustomerArgs = {
  input: CreateCustomerInput;
};


export type RootMutationCreateCustomerCredentialArgs = {
  input: CreateCustomerCredentialInput;
};


export type RootMutationCreateCustomerUserArgs = {
  input: CreateCustomerUserInput;
};


export type RootMutationCreateExternalLogStreamArgs = {
  input: CreateExternalLogStreamInput;
};


export type RootMutationCreateInstanceArgs = {
  input: CreateInstanceInput;
};


export type RootMutationCreateIntegrationArgs = {
  input: CreateIntegrationInput;
};


export type RootMutationCreateOrganizationCredentialArgs = {
  input: CreateOrganizationCredentialInput;
};


export type RootMutationCreateOrganizationSigningKeyArgs = {
  input: CreateOrganizationSigningKeyInput;
};


export type RootMutationCreateOrganizationUserArgs = {
  input: CreateOrganizationUserInput;
};


export type RootMutationDeleteAlertGroupArgs = {
  input: DeleteAlertGroupInput;
};


export type RootMutationDeleteAlertMonitorArgs = {
  input: DeleteAlertMonitorInput;
};


export type RootMutationDeleteAlertWebhookArgs = {
  input: DeleteAlertWebhookInput;
};


export type RootMutationDeleteComponentArgs = {
  input: DeleteComponentInput;
};


export type RootMutationDeleteCredentialArgs = {
  input: DeleteCredentialInput;
};


export type RootMutationDeleteCustomerArgs = {
  input: DeleteCustomerInput;
};


export type RootMutationDeleteExternalLogStreamArgs = {
  input: DeleteExternalLogStreamInput;
};


export type RootMutationDeleteInstanceArgs = {
  input: DeleteInstanceInput;
};


export type RootMutationDeleteIntegrationArgs = {
  input: DeleteIntegrationInput;
};


export type RootMutationDeleteOrganizationArgs = {
  input: DeleteOrganizationInput;
};


export type RootMutationDeleteOrganizationSigningKeyArgs = {
  input: DeleteOrganizationSigningKeyInput;
};


export type RootMutationDeleteUserArgs = {
  input: DeleteUserInput;
};


export type RootMutationDeleteUserLevelConfigArgs = {
  input: DeleteUserLevelConfigInput;
};


export type RootMutationDeployInstanceArgs = {
  input: DeployInstanceInput;
};


export type RootMutationDisconnectConnectionArgs = {
  input: DisconnectConnectionInput;
};


export type RootMutationDisconnectUserLevelConnectionArgs = {
  input: DisconnectUserLevelConnectionInput;
};


export type RootMutationFetchConfigWizardPageContentArgs = {
  input: FetchConfigWizardPageContentInput;
};


export type RootMutationFetchDataSourceContentArgs = {
  input: FetchDataSourceContentInput;
};


export type RootMutationForkIntegrationArgs = {
  input: ForkIntegrationInput;
};


export type RootMutationImportIntegrationArgs = {
  input: ImportIntegrationInput;
};


export type RootMutationImportOrganizationSigningKeyArgs = {
  input: ImportOrganizationSigningKeyInput;
};


export type RootMutationPublishComponentArgs = {
  input: PublishComponentInput;
};


export type RootMutationPublishIntegrationArgs = {
  input: PublishIntegrationInput;
};


export type RootMutationReplayExecutionArgs = {
  input: ReplayExecutionInput;
};


export type RootMutationRequestOAuth2CredentialAuthorizationArgs = {
  input: RequestOAuth2CredentialAuthorizationInput;
};


export type RootMutationTestInstanceFlowConfigArgs = {
  input: TestInstanceFlowConfigInput;
};


export type RootMutationTestIntegrationEndpointConfigArgs = {
  input: TestIntegrationEndpointConfigInput;
};


export type RootMutationTestIntegrationFlowArgs = {
  input: TestIntegrationFlowInput;
};


export type RootMutationUpdateAlertGroupArgs = {
  input: UpdateAlertGroupInput;
};


export type RootMutationUpdateAlertMonitorArgs = {
  input: UpdateAlertMonitorInput;
};


export type RootMutationUpdateAlertWebhookArgs = {
  input: UpdateAlertWebhookInput;
};


export type RootMutationUpdateComponentArgs = {
  input: UpdateComponentInput;
};


export type RootMutationUpdateCredentialArgs = {
  input: UpdateCredentialInput;
};


export type RootMutationUpdateCustomerArgs = {
  input: UpdateCustomerInput;
};


export type RootMutationUpdateExternalLogStreamArgs = {
  input: UpdateExternalLogStreamInput;
};


export type RootMutationUpdateInstanceArgs = {
  input: UpdateInstanceInput;
};


export type RootMutationUpdateInstanceConfigVariablesArgs = {
  input: UpdateInstanceConfigVariablesInput;
};


export type RootMutationUpdateIntegrationArgs = {
  input: UpdateIntegrationInput;
};


export type RootMutationUpdateIntegrationMarketplaceConfigurationArgs = {
  input: UpdateIntegrationMarketplaceConfigurationInput;
};


export type RootMutationUpdateIntegrationVersionAvailabilityArgs = {
  input: UpdateIntegrationVersionAvailabilityInput;
};


export type RootMutationUpdateOAuth2ConnectionArgs = {
  input: UpdateOAuth2ConnectionInput;
};


export type RootMutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


export type RootMutationUpdateThemeArgs = {
  input: UpdateThemeInput;
};


export type RootMutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type RootQuery = {
  __typename?: 'RootQuery';
  /**
   *
   *     Returns the specified Action object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  action?: Maybe<Action>;
  /**
   *
   *     Returns a Relay Connection to a collection of Action objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  actions: ActionConnection;
  /**
   *
   *     Returns a Relay Connection to a collection of Activity objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_view_activities].
   *     3. The signed-in User has any of the following permissions for the object's 'user_Customer' attribute: [customer_view_activities].
   */
  activities: ActivityConnection;
  /**
   *
   *     Returns the specified Activity object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_view_activities].
   *     3. The signed-in User has any of the following permissions for the object's 'user_Customer' attribute: [customer_view_activities].
   */
  activity?: Maybe<Activity>;
  /**
   *
   *     Returns the specified AlertEvent object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'monitor_Instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_admin_manage_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'monitor_Instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertEvent?: Maybe<AlertEvent>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertEvent objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'monitor_Instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_admin_manage_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'monitor_Instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertEvents: AlertEventConnection;
  /**
   *
   *     Returns the specified AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertGroup?: Maybe<AlertGroup>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertGroup objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertGroups: AlertGroupConnection;
  /**
   *
   *     Returns the specified AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertMonitor?: Maybe<AlertMonitor>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertMonitor objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertMonitors: AlertMonitorConnection;
  /**
   *
   *     Returns the specified AlertTrigger object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  alertTrigger?: Maybe<AlertTrigger>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertTrigger objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  alertTriggers: AlertTriggerConnection;
  /**
   *
   *     Returns the specified AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertWebhook?: Maybe<AlertWebhook>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertWebhook objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertWebhooks: AlertWebhookConnection;
  /**
   *
   *     Returns the specified AuthObjectType object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authObjectType?: Maybe<AuthObjectType>;
  /**
   *
   *     Returns a Relay Connection to a collection of AuthObjectType objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authObjectTypes: AuthObjectTypeConnection;
  /**
   *
   *     Returns the signed-in User.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  authenticatedUser: User;
  /**
   *
   *     Returns the specified AuthorizationMethod object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authorizationMethod?: Maybe<AuthorizationMethod>;
  /**
   *
   *     Returns a Relay Connection to a collection of AuthorizationMethod objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authorizationMethods: AuthorizationMethodConnection;
  /** DEPRECATED. Prefer using integrationCategories instead. */
  categories: Array<Maybe<IntegrationCategory>>;
  /**
   *
   *     Returns the specified Component object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'public' attribute equals: True.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_component_permissions, org_manage_components, org_view_components].
   *     3. The signed-in User has any of the following permissions for any version of the object: [component_view, component_edit, component_remove, component_admin_permissions, component_publish_new_version].
   *     4. The signed-in User has any of the following permissions for the associated Customer: [customer_view_org_components].
   */
  component?: Maybe<Component>;
  /** Returns a list of Component categories. */
  componentCategories: Array<Maybe<ComponentCategory>>;
  /** Returns a list of unique Component labels. */
  componentLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns a Relay Connection to a collection of Component objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'public' attribute equals: True.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_component_permissions, org_manage_components, org_view_components].
   *     3. The signed-in User has any of the following permissions for any version of the object: [component_view, component_edit, component_remove, component_admin_permissions, component_publish_new_version].
   *     4. The signed-in User has any of the following permissions for the associated Customer: [customer_view_org_components].
   */
  components: ComponentConnection;
  /**
   *
   *     Returns the specified Credential object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_view_customers, org_manage_integrations, org_view_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  credential?: Maybe<Credential>;
  /**
   *
   *     Returns a Relay Connection to a collection of Credential objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_view_customers, org_manage_integrations, org_view_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  credentials: CredentialConnection;
  /**
   *
   *     Returns the specified Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_crud_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations, customer_access_marketplace_integrations].
   */
  customer?: Maybe<Customer>;
  /** Returns a list of unique Customer labels. */
  customerLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns a list of Customer Role objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The Role level is less than that of the signed-in User's Role.
   */
  customerRoles: Array<Maybe<Role>>;
  /**
   *
   *     Returns the specified CustomerTotalUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  customerTotalUsageMetric?: Maybe<CustomerTotalUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of CustomerTotalUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  customerTotalUsageMetrics: CustomerTotalUsageMetricsConnection;
  /**
   *
   *     Returns a Relay Connection to a collection of Customer objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_crud_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations, customer_access_marketplace_integrations].
   */
  customers: CustomerConnection;
  /**
   *
   *     Returns the specified InstanceExecutionResult object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     4. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  executionResult?: Maybe<InstanceExecutionResult>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceExecutionResult objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     4. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  executionResults: InstanceExecutionResultConnection;
  /**
   *
   *     Returns the specified ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  externalLogStream?: Maybe<ExternalLogStream>;
  /**
   *
   *     Returns a Relay Connection to a collection of ExternalLogStream objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  externalLogStreams: ExternalLogStreamConnection;
  /**
   *
   *     Returns the specified Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     6. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  instance?: Maybe<Instance>;
  /**
   *
   *     Returns the specified InstanceDailyUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  instanceDailyUsageMetric?: Maybe<InstanceDailyUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceDailyUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  instanceDailyUsageMetrics: InstanceDailyUsageMetricsConnection;
  /**
   *
   *     Returns the specified InstanceFlowConfig object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_manage_marketplace_integrations].
   */
  instanceFlowConfig?: Maybe<InstanceFlowConfig>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceFlowConfig objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_manage_marketplace_integrations].
   */
  instanceFlowConfigs: InstanceFlowConfigConnection;
  /** Returns a list of unique Instance labels. */
  instanceLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns a Relay Connection to a collection of Instance objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     6. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  instances: InstanceConnection;
  /**
   *
   *     Returns the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE OR CUSTOMER_AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  integration?: Maybe<Integration>;
  /** Returns a list of Integration categories. */
  integrationCategories: Array<Maybe<IntegrationCategory>>;
  /** Returns a list of unique Integration labels. */
  integrationLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns a Relay Connection to a collection of Integration objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE OR CUSTOMER_AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  integrations: IntegrationConnection;
  /**
   *
   *     Returns the specified Log object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     5. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   */
  log?: Maybe<Log>;
  /** Returns a list of LogSeverity objects. */
  logSeverityLevels: Array<Maybe<LogSeverity>>;
  /**
   *
   *     Returns a Relay Connection to a collection of Log objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     5. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   */
  logs: LogConnection;
  /**
   *
   *     Returns the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE OR CUSTOMER_AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  marketplaceIntegration?: Maybe<Integration>;
  /**
   *
   *     Returns a Relay Connection to a collection of Integration objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE OR CUSTOMER_AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  marketplaceIntegrations: IntegrationConnection;
  /**
   *
   *     Returns the specified ObjectPermissionGrant object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  objectPermissionGrant?: Maybe<ObjectPermissionGrant>;
  /**
   *
   *     Returns a Relay Connection to a collection of ObjectPermissionGrant objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  objectPermissionGrants: ObjectPermissionGrantConnection;
  /**
   *
   *     Returns the specified OrgDailyUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgDailyUsageMetric?: Maybe<OrgDailyUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of OrgDailyUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgDailyUsageMetrics: OrgDailyUsageMetricsConnection;
  /**
   *
   *     Returns the specified OrgTotalUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgTotalUsageMetric?: Maybe<OrgTotalUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of OrgTotalUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgTotalUsageMetrics: OrgTotalUsageMetricsConnection;
  /**
   *
   *     Returns the Organization of the signed-in User if the User is an Organization User.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_view].
   */
  organization?: Maybe<Organization>;
  /**
   *
   *     Returns a list of Organization Role objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The Role level is less than that of the signed-in User's Role.
   */
  organizationRoles: Array<Maybe<Role>>;
  /**
   *
   *     Returns the specified Permission object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  permission?: Maybe<Permission>;
  /**
   *
   *     Returns a Relay Connection to a collection of Permission objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  permissions: PermissionConnection;
  /**
   *
   *     Returns the specified StarredRecord object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   */
  starredRecord?: Maybe<StarredRecord>;
  /**
   *
   *     Returns a Relay Connection to a collection of StarredRecord objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   */
  starredRecords: StarredRecordConnection;
  /**
   *
   *     Returns the Organization Theme of the signed-in User.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  theme?: Maybe<Theme>;
  /** Returns a pre-signed URL for uploading the specified media file. */
  uploadMedia: UploadMedia;
  /**
   *
   *     Returns the specified User object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  user?: Maybe<User>;
  /** Returns whether a User exists with the specified email address. */
  userExists: Scalars['Boolean'];
  /**
   *
   *     Returns a Relay Connection to a collection of User objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  users: UserConnection;
};


export type RootQueryActionArgs = {
  id: Scalars['ID'];
};


export type RootQueryActionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  component?: InputMaybe<Scalars['ID']>;
  dataSourceType?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  isCommonTrigger?: InputMaybe<Scalars['Boolean']>;
  isDataSource?: InputMaybe<Scalars['Boolean']>;
  isTrigger?: InputMaybe<Scalars['Boolean']>;
  key?: InputMaybe<Scalars['String']>;
  key_Icontains?: InputMaybe<Scalars['String']>;
  label_Fulltext?: InputMaybe<Scalars['String']>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ActionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ActionOrder>>>;
};


export type RootQueryActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ActivityOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ActivityOrder>>>;
};


export type RootQueryActivityArgs = {
  id: Scalars['ID'];
};


export type RootQueryAlertEventArgs = {
  id: Scalars['ID'];
};


export type RootQueryAlertEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAt_Gte?: InputMaybe<Scalars['DateTime']>;
  createdAt_Lte?: InputMaybe<Scalars['DateTime']>;
  details_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  monitor?: InputMaybe<Scalars['ID']>;
  monitor_FlowConfig?: InputMaybe<Scalars['ID']>;
  monitor_Instance?: InputMaybe<Scalars['ID']>;
  monitor_Instance_Customer?: InputMaybe<Scalars['ID']>;
  monitor_Instance_Integration?: InputMaybe<Scalars['ID']>;
  monitor_Instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  monitor_Name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertEventOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertEventOrder>>>;
};


export type RootQueryAlertGroupArgs = {
  id: Scalars['ID'];
};


export type RootQueryAlertGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type RootQueryAlertMonitorArgs = {
  id: Scalars['ID'];
};


export type RootQueryAlertMonitorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Name_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars['DateTime']>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars['DateTime']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars['Boolean']>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  triggers_Name_Icontains?: InputMaybe<Scalars['String']>;
};


export type RootQueryAlertTriggerArgs = {
  id: Scalars['ID'];
};


export type RootQueryAlertTriggersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  isInstanceSpecific?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertTriggerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertTriggerOrder>>>;
};


export type RootQueryAlertWebhookArgs = {
  id: Scalars['ID'];
};


export type RootQueryAlertWebhooksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AlertWebhookOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertWebhookOrder>>>;
  url_Icontains?: InputMaybe<Scalars['String']>;
};


export type RootQueryAuthObjectTypeArgs = {
  id: Scalars['ID'];
};


export type RootQueryAuthObjectTypesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AuthObjectTypeOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AuthObjectTypeOrder>>>;
};


export type RootQueryAuthorizationMethodArgs = {
  id: Scalars['ID'];
};


export type RootQueryAuthorizationMethodsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type RootQueryComponentArgs = {
  id: Scalars['ID'];
};


export type RootQueryComponentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  allVersions?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasActions?: InputMaybe<Scalars['Boolean']>;
  hasCommonTriggers?: InputMaybe<Scalars['Boolean']>;
  hasConnections?: InputMaybe<Scalars['Boolean']>;
  hasDataSources?: InputMaybe<Scalars['Boolean']>;
  hasDataSourcesOfType?: InputMaybe<Scalars['String']>;
  hasTriggers?: InputMaybe<Scalars['Boolean']>;
  key?: InputMaybe<Scalars['String']>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars['Boolean']>;
  searchTerms_Fulltext?: InputMaybe<Scalars['String']>;
  searchTerms_Icontains?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


export type RootQueryCredentialArgs = {
  id: Scalars['ID'];
};


export type RootQueryCredentialsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorizationMethod_Key?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  label_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CredentialOrder>;
  readyForUse?: InputMaybe<Scalars['Boolean']>;
  sortBy?: InputMaybe<Array<InputMaybe<CredentialOrder>>>;
};


export type RootQueryCustomerArgs = {
  id: Scalars['ID'];
};


export type RootQueryCustomerTotalUsageMetricArgs = {
  id: Scalars['ID'];
};


export type RootQueryCustomerTotalUsageMetricsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CustomerTotalUsageMetricsOrder>;
  snapshotTime_Gte?: InputMaybe<Scalars['DateTime']>;
  snapshotTime_Lte?: InputMaybe<Scalars['DateTime']>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerTotalUsageMetricsOrder>>>;
};


export type RootQueryCustomersArgs = {
  after?: InputMaybe<Scalars['String']>;
  allowEmbeddedDesigner?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  externalId_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  name_Istartswith?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CustomerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerOrder>>>;
};


export type RootQueryExecutionResultArgs = {
  id: Scalars['ID'];
};


export type RootQueryExecutionResultsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  endedAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  endedAt_Lte?: InputMaybe<Scalars['DateTime']>;
  error_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['UUID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  instance_Isnull?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  isTestExecution?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  maxRetryCount?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Gte?: InputMaybe<Scalars['Int']>;
  maxRetryCount_Lte?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  retryCount?: InputMaybe<Scalars['Int']>;
  retryCount_Gte?: InputMaybe<Scalars['Int']>;
  retryCount_Lte?: InputMaybe<Scalars['Int']>;
  retryForExecution_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Gte?: InputMaybe<Scalars['DateTime']>;
  retryNextAt_Isnull?: InputMaybe<Scalars['Boolean']>;
  retryNextAt_Lte?: InputMaybe<Scalars['DateTime']>;
  retryUniqueRequestId?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars['DateTime']>;
  startedAt_Lte?: InputMaybe<Scalars['DateTime']>;
};


export type RootQueryExternalLogStreamArgs = {
  id: Scalars['ID'];
};


export type RootQueryExternalLogStreamsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExternalLogStreamOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ExternalLogStreamOrder>>>;
};


export type RootQueryInstanceArgs = {
  id: Scalars['ID'];
};


export type RootQueryInstanceDailyUsageMetricArgs = {
  id: Scalars['ID'];
};


export type RootQueryInstanceDailyUsageMetricsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  instance?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceDailyUsageMetricsOrder>;
  snapshotDate?: InputMaybe<Scalars['Date']>;
  snapshotDate_Gte?: InputMaybe<Scalars['Date']>;
  snapshotDate_Lte?: InputMaybe<Scalars['Date']>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceDailyUsageMetricsOrder>>>;
};


export type RootQueryInstanceFlowConfigArgs = {
  id: Scalars['ID'];
};


export type RootQueryInstanceFlowConfigsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flow_Name?: InputMaybe<Scalars['String']>;
  inFailedState?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceFlowConfigOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceFlowConfigOrder>>>;
};


export type RootQueryInstancesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  compatibility?: InputMaybe<Scalars['Int']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_ExternalId?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  integration?: InputMaybe<Scalars['ID']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  needsDeploy?: InputMaybe<Scalars['Boolean']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
};


export type RootQueryIntegrationArgs = {
  id: Scalars['ID'];
};


export type RootQueryIntegrationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  allVersions?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  category_Icontains?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasInstances?: InputMaybe<Scalars['Boolean']>;
  hasUnpublishedChanges?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  marketplace?: InputMaybe<Scalars['Boolean']>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  useAsTemplate?: InputMaybe<Scalars['Boolean']>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


export type RootQueryLogArgs = {
  id: Scalars['ID'];
};


export type RootQueryLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  configVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
  executionResult?: InputMaybe<Scalars['ID']>;
  executionResult_IsTestExecution?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  last?: InputMaybe<Scalars['Int']>;
  message_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LogOrder>;
  severity?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars['DateTime']>;
  timestamp_Lte?: InputMaybe<Scalars['DateTime']>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
};


export type RootQueryMarketplaceIntegrationArgs = {
  id: Scalars['ID'];
};


export type RootQueryMarketplaceIntegrationsArgs = {
  activated?: InputMaybe<Scalars['Boolean']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<Scalars['String']>;
  category_Icontains?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  description_Icontains?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasUnpublishedChanges?: InputMaybe<Scalars['Boolean']>;
  includeActiveIntegrations?: InputMaybe<Scalars['Boolean']>;
  labels_Icontains?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars['String']>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars['String']>;
  useAsTemplate?: InputMaybe<Scalars['Boolean']>;
  versionIsAvailable?: InputMaybe<Scalars['Boolean']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
  versionSequenceId?: InputMaybe<Scalars['UUID']>;
};


export type RootQueryObjectPermissionGrantArgs = {
  id: Scalars['ID'];
};


export type RootQueryObjectPermissionGrantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  grantedByRole?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
  obj?: InputMaybe<Scalars['UUID']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ObjectPermissionGrantOrder>;
  permission?: InputMaybe<Scalars['ID']>;
  sortBy?: InputMaybe<Array<InputMaybe<ObjectPermissionGrantOrder>>>;
  user?: InputMaybe<Scalars['ID']>;
};


export type RootQueryOrgDailyUsageMetricArgs = {
  id: Scalars['ID'];
};


export type RootQueryOrgDailyUsageMetricsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrgDailyUsageMetricsOrder>;
  snapshotDate?: InputMaybe<Scalars['Date']>;
  snapshotDate_Gte?: InputMaybe<Scalars['Date']>;
  snapshotDate_Lte?: InputMaybe<Scalars['Date']>;
  sortBy?: InputMaybe<Array<InputMaybe<OrgDailyUsageMetricsOrder>>>;
};


export type RootQueryOrgTotalUsageMetricArgs = {
  id: Scalars['ID'];
};


export type RootQueryOrgTotalUsageMetricsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrgTotalUsageMetricsOrder>;
  snapshotTime_Gte?: InputMaybe<Scalars['DateTime']>;
  snapshotTime_Lte?: InputMaybe<Scalars['DateTime']>;
  sortBy?: InputMaybe<Array<InputMaybe<OrgTotalUsageMetricsOrder>>>;
};


export type RootQueryPermissionArgs = {
  id: Scalars['ID'];
};


export type RootQueryPermissionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  objType?: InputMaybe<Scalars['ID']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PermissionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<PermissionOrder>>>;
};


export type RootQueryStarredRecordArgs = {
  id: Scalars['ID'];
};


export type RootQueryStarredRecordsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StarredRecordOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<StarredRecordOrder>>>;
};


export type RootQueryUploadMediaArgs = {
  fileName: Scalars['String'];
  mediaType: MediaType;
  objectId: Scalars['ID'];
};


export type RootQueryUserArgs = {
  id: Scalars['ID'];
};


export type RootQueryUserExistsArgs = {
  email: Scalars['String'];
};


export type RootQueryUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  customer?: InputMaybe<Scalars['ID']>;
  customer_Isnull?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  email_Icontains?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  externalId_Isnull?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  name_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
};

export type StarredRecord = Node & {
  __typename?: 'StarredRecord';
  /** Specifies whether the signed-in User can remove the StarredRecord. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the StarredRecord. */
  allowUpdate: Scalars['Boolean'];
  description?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Date/Time when the record was starred */
  timestamp: Scalars['DateTime'];
  /** User that starred a record */
  user: User;
};

/** Represents a Relay Connection to a collection of StarredRecord objects. */
export type StarredRecordConnection = {
  __typename?: 'StarredRecordConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<StarredRecordEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<StarredRecord>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related StarredRecord object and a cursor for pagination. */
export type StarredRecordEdge = {
  __typename?: 'StarredRecordEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<StarredRecord>;
};

/** Allows specifying which field and direction to order by. */
export type StarredRecordOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: StarredRecordOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum StarredRecordOrderField {
  Timestamp = 'TIMESTAMP'
}

export type TestInstanceFlowConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The content type of the payload to send with the POST request that triggers the InstanceFlowConfig. */
  contentType?: InputMaybe<Scalars['String']>;
  /** The headers to send with the POST request that triggers the InstanceFlowConfig. */
  headers?: InputMaybe<Scalars['String']>;
  /** The ID of the InstanceFlowConfig to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The payload to send with the POST request that triggers the InstanceFlowConfig. */
  payload?: InputMaybe<Scalars['String']>;
};

export type TestInstanceFlowConfigPayload = {
  __typename?: 'TestInstanceFlowConfigPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  testInstanceFlowConfigResult?: Maybe<TestInstanceFlowConfigResult>;
};

/** Result of testing an InstanceFlowConfig. */
export type TestInstanceFlowConfigResult = {
  __typename?: 'TestInstanceFlowConfigResult';
  /** The HTTP body of the response returned by the InstanceFlowConfig's Trigger. */
  body?: Maybe<Scalars['String']>;
  /** The InstanceExecutionResult that specifies the result of testing the InstanceFlowConfig. */
  execution?: Maybe<InstanceExecutionResult>;
  /** The InstanceFlowConfig that was tested. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** The HTTP headers of the response returned by the InstanceFlowConfig's Trigger. */
  headers?: Maybe<Scalars['JSONString']>;
  /** The HTTP status code of the response returned by the InstanceFlowConfig's Trigger. */
  statusCode?: Maybe<Scalars['Int']>;
};

export type TestIntegrationEndpointConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The content type of the payload to send with the POST request to test the endpoint configuration for the Integration. */
  contentType?: InputMaybe<Scalars['String']>;
  /** The headers to send with the POST request to test the endpoint configuration for the Integration. */
  headers?: InputMaybe<Scalars['String']>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The payload to send with the POST request to test the endpoint configuration for the Integration. */
  payload?: InputMaybe<Scalars['String']>;
};

export type TestIntegrationEndpointConfigPayload = {
  __typename?: 'TestIntegrationEndpointConfigPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  testIntegrationEndpointConfigResult?: Maybe<TestIntegrationEndpointConfigResult>;
};

/** Result of testing an Integration endpoint config. */
export type TestIntegrationEndpointConfigResult = {
  __typename?: 'TestIntegrationEndpointConfigResult';
  /** The HTTP body of the response returned as a result of testing the Integration endpoint configuration. */
  body?: Maybe<Scalars['String']>;
  /** The InstanceExecutionResult that specifies the result of testing the endpoint configuration for the specified Integration. */
  execution?: Maybe<InstanceExecutionResult>;
  /** The HTTP headers of the response returned as a result of testing the Integration endpoint configuration. */
  headers?: Maybe<Scalars['JSONString']>;
  /** The Integration for which the associated endpoint configuration was tested. */
  integration?: Maybe<Integration>;
  /** The HTTP status code of the response returned as a result of testing the Integration endpoint configuration. */
  statusCode?: Maybe<Scalars['Int']>;
};

export type TestIntegrationFlowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The content type of the payload to send with the POST request that triggers the Integration Flow Test Instance. */
  contentType?: InputMaybe<Scalars['String']>;
  /** The headers to send with the POST request that triggers the Integration Flow Test Instance. */
  headers?: InputMaybe<Scalars['String']>;
  /** The ID of the IntegrationFlow to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The payload to send with the POST request that triggers the Integration Flow Test Instance. */
  payload?: InputMaybe<Scalars['String']>;
};

export type TestIntegrationFlowPayload = {
  __typename?: 'TestIntegrationFlowPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  testIntegrationFlowResult?: Maybe<TestIntegrationFlowResult>;
};

/** Result of testing an IntegrationFlow. */
export type TestIntegrationFlowResult = {
  __typename?: 'TestIntegrationFlowResult';
  /** The HTTP body of the response returned by the InstanceFlow's Trigger. */
  body?: Maybe<Scalars['String']>;
  /** The InstanceExecutionResult that specifies the result of testing the IntegrationFlow. */
  execution?: Maybe<InstanceExecutionResult>;
  /** The IntegrationFlow that was tested. */
  flow?: Maybe<IntegrationFlow>;
  /** The HTTP headers of the response returned by the InstanceFlow's Trigger. */
  headers?: Maybe<Scalars['JSONString']>;
  /** The HTTP status code of the response returned by the InstanceFlow's Trigger. */
  statusCode?: Maybe<Scalars['Int']>;
};

/** Represents the Theme associated with an Organization. */
export type Theme = Node & {
  __typename?: 'Theme';
  /** Specifies whether the signed-in User can remove the Theme. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the Theme. */
  allowUpdate: Scalars['Boolean'];
  /** The Theme the Color is associated with. */
  colors: ThemeColorConnection;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Theme the Property is associated with. */
  properties: ThemePropertyConnection;
};


/** Represents the Theme associated with an Organization. */
export type ThemeColorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/** Represents the Theme associated with an Organization. */
export type ThemePropertiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

/** Represents a Color and its various properties used to style the Organization Theme. */
export type ThemeColor = Node & {
  __typename?: 'ThemeColor';
  /** Specifies whether the signed-in User can remove the ThemeColor. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the ThemeColor. */
  allowUpdate: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Type of Theme Color. */
  type: ThemeColorType;
  /** The Value of the Theme Color. */
  value: Scalars['String'];
  /** The Theme Variant this Color will be used with. */
  variant: ThemeColorVariant;
};

/** Represents a Relay Connection to a collection of ThemeColor objects. */
export type ThemeColorConnection = {
  __typename?: 'ThemeColorConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ThemeColorEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ThemeColor>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related ThemeColor object and a cursor for pagination. */
export type ThemeColorEdge = {
  __typename?: 'ThemeColorEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<ThemeColor>;
};

/** Represents a Theme Color of a given Type and the Variant that it is associated with. */
export type ThemeColorInput = {
  /** The type of Color. */
  type: Scalars['String'];
  /** The value of the color. */
  value: Scalars['String'];
  /** The Theme variant the color is associated with */
  variant: Scalars['String'];
};

/** An enumeration. */
export enum ThemeColorType {
  /** Accent */
  Accent = 'ACCENT',
  /** Background */
  Background = 'BACKGROUND',
  /** Debug */
  Debug = 'DEBUG',
  /** Error */
  Error = 'ERROR',
  /** Icon Color */
  IconColor = 'ICON_COLOR',
  /** Info */
  Info = 'INFO',
  /** Link Color */
  LinkColor = 'LINK_COLOR',
  /** Metric */
  Metric = 'METRIC',
  /** Other01 */
  Other01 = 'OTHER01',
  /** Primary */
  Primary = 'PRIMARY',
  /** Secondary */
  Secondary = 'SECONDARY',
  /** Sidebar */
  Sidebar = 'SIDEBAR',
  /** Success */
  Success = 'SUCCESS',
  /** Trace */
  Trace = 'TRACE',
  /** Warning */
  Warning = 'WARNING'
}

/** An enumeration. */
export enum ThemeColorVariant {
  /** Dark */
  Dark = 'DARK',
  /** Embedded Dark */
  EmbeddedDark = 'EMBEDDED_DARK',
  /** Embedded Light */
  EmbeddedLight = 'EMBEDDED_LIGHT',
  /** Light */
  Light = 'LIGHT'
}

/** Represents a Property of a given type used to style the Organization Theme. */
export type ThemeProperty = Node & {
  __typename?: 'ThemeProperty';
  /** Specifies whether the signed-in User can remove the ThemeProperty. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the ThemeProperty. */
  allowUpdate: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Type of Theme Property. */
  type: ThemePropertyType;
  /** The Value of the Theme Property. */
  value: Scalars['String'];
  /** The Theme Variant this Color will be used with. */
  variant?: Maybe<ThemePropertyVariant>;
};

/** Represents a Relay Connection to a collection of ThemeProperty objects. */
export type ThemePropertyConnection = {
  __typename?: 'ThemePropertyConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ThemePropertyEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ThemeProperty>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related ThemeProperty object and a cursor for pagination. */
export type ThemePropertyEdge = {
  __typename?: 'ThemePropertyEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<ThemeProperty>;
};

/** Represents a Property used to style a Theme */
export type ThemePropertyInput = {
  /** The type of Theme Property. */
  type: Scalars['String'];
  /** The value of the Property. */
  value: Scalars['String'];
  /** The Theme variant the color is associated with */
  variant?: InputMaybe<Scalars['String']>;
};

/** An enumeration. */
export enum ThemePropertyType {
  /** Border Radius */
  BorderRadius = 'BORDER_RADIUS',
  /** Disable Elevation */
  DisableElevation = 'DISABLE_ELEVATION'
}

/** An enumeration. */
export enum ThemePropertyVariant {
  /** Dark */
  Dark = 'DARK',
  /** Embedded Dark */
  EmbeddedDark = 'EMBEDDED_DARK',
  /** Embedded Light */
  EmbeddedLight = 'EMBEDDED_LIGHT',
  /** Light */
  Light = 'LIGHT'
}

/** Represents a collection of data that defines a Component Trigger. */
export type TriggerDefinitionInput = {
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching?: InputMaybe<Scalars['Boolean']>;
  /** Specifies how the Action handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: InputMaybe<Scalars['Boolean']>;
  /** Specifies how the Component Action is displayed. */
  display: ActionDisplayDefinition;
  /** The input associated with dynamic branching. */
  dynamicBranchInput?: InputMaybe<Scalars['String']>;
  /** An example of the returned payload of an Action. */
  examplePayload?: InputMaybe<Scalars['JSONString']>;
  /** The InputFields supported by the Component Action. */
  inputs: Array<InputMaybe<InputFieldDefinition>>;
  isCommonTrigger?: InputMaybe<Scalars['Boolean']>;
  /** A string which uniquely identifies the Action in the context of the Component. */
  key: Scalars['String'];
  /** Specifies support for triggering an Integration on a recurring schedule. */
  scheduleSupport?: InputMaybe<Scalars['String']>;
  /** The static branch names associated with an Action. */
  staticBranchNames?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Specifies support for synchronous responses to an Integration webhook request. */
  synchronousResponseSupport?: InputMaybe<Scalars['String']>;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateAlertGroupInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the AlertGroup to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The name of the AlertGroup */
  name?: InputMaybe<Scalars['String']>;
  /** The users in the AlertGroup. */
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The AlertWebhooks in the AlertGroup */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type UpdateAlertGroupPayload = {
  __typename?: 'UpdateAlertGroupPayload';
  alertGroup?: Maybe<AlertGroup>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type UpdateAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The execution duration condition to monitor for relevant AlertTrigger types. */
  durationSecondsCondition?: InputMaybe<Scalars['Int']>;
  /** The execution overdue condition to monitor for relevant AlertTrigger types. */
  executionOverdueMinutesCondition?: InputMaybe<Scalars['Int']>;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  flowConfig?: InputMaybe<Scalars['ID']>;
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  groups?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The log severity level condition to monitor for relevant AlertTrigger types. */
  logSeverityLevelCondition?: InputMaybe<Scalars['Int']>;
  /** The name of the AlertMonitor. */
  name?: InputMaybe<Scalars['String']>;
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  triggers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The Users to notify when the AlertMonitor is triggered. */
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type UpdateAlertMonitorPayload = {
  __typename?: 'UpdateAlertMonitorPayload';
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type UpdateAlertWebhookInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** A JSON string of key/value pairs that will be sent as headers in the Webhook request. */
  headers?: InputMaybe<Scalars['String']>;
  /** The ID of the AlertWebhook to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The name of the AlertWebhook. */
  name?: InputMaybe<Scalars['String']>;
  /** The template that is hydrated and then used as the body of the AlertWebhook request. */
  payloadTemplate?: InputMaybe<Scalars['String']>;
  /** The URL of the AlertWebhook. */
  url?: InputMaybe<Scalars['String']>;
};

export type UpdateAlertWebhookPayload = {
  __typename?: 'UpdateAlertWebhookPayload';
  alertWebhook?: Maybe<AlertWebhook>;
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
};

export type UpdateComponentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Component to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateComponentPayload = {
  __typename?: 'UpdateComponentPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  component?: Maybe<Component>;
  errors: Array<ErrorType>;
};

export type UpdateCredentialInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Credential to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The name of the Credential. */
  label?: InputMaybe<Scalars['String']>;
  /** A list of InputCredentialFieldValues that contain the values for the CredentialFields. */
  values?: InputMaybe<Array<InputMaybe<InputCredentialFieldValue>>>;
};

export type UpdateCredentialPayload = {
  __typename?: 'UpdateCredentialPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type UpdateCustomerInput = {
  /** Adds the specified Attachment to the object. */
  addAttachment?: InputMaybe<AttachmentInput>;
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner?: InputMaybe<Scalars['Boolean']>;
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Additional notes about the Customer. */
  description?: InputMaybe<Scalars['String']>;
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars['String']>;
  /** The ID of the Customer to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** The name of the Customer, which must be unique within the scope of its Organization. */
  name?: InputMaybe<Scalars['String']>;
  /** Renames the specified Attachment on the object. */
  removeAttachment?: InputMaybe<AttachmentInput>;
  /** Removes the specified Attachment from the object. */
  renameAttachment?: InputMaybe<AttachmentRenameInput>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateCustomerPayload = {
  __typename?: 'UpdateCustomerPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  customer?: Maybe<Customer>;
  errors: Array<ErrorType>;
};

export type UpdateExternalLogStreamInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** A JSON string of key/value pairs that will be sent as headers in the ExternalLogStream request. */
  headers?: InputMaybe<Scalars['String']>;
  /** The ID of the ExternalLogStream to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** Name of the ExternalLogStream. */
  name?: InputMaybe<Scalars['String']>;
  /** The template that is hydrated and then used as the body of the ExternalLogStream request. */
  payloadTemplate?: InputMaybe<Scalars['String']>;
  /** The Log severity levels for which Logs should be sent to the ExternalLogStream. */
  severityLevels?: InputMaybe<Array<InputMaybe<LogSeverityLevelInput>>>;
  /** The URL of the ExternalLogStream. */
  url?: InputMaybe<Scalars['String']>;
};

export type UpdateExternalLogStreamPayload = {
  __typename?: 'UpdateExternalLogStreamPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  externalLogStream?: Maybe<ExternalLogStream>;
};

export type UpdateInstanceConfigVariablesInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Instance with which the Config Variable is associated. */
  configVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type UpdateInstanceConfigVariablesPayload = {
  __typename?: 'UpdateInstanceConfigVariablesPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type UpdateInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Instance with which the Config Variable is associated. */
  configVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** Additional notes about the Instance. */
  description?: InputMaybe<Scalars['String']>;
  /** Specifies whether the Instance is currently enabled and in an executable state. */
  enabled?: InputMaybe<Scalars['Boolean']>;
  /** The configuration for the IntegrationFlow associated with the Instance. */
  flowConfigs?: InputMaybe<Array<InputMaybe<InputInstanceFlowConfig>>>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The Integration that has been deployed for the Instance. */
  integration?: InputMaybe<Scalars['ID']>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** The name of the Instance. */
  name?: InputMaybe<Scalars['String']>;
  /** Specifies whether to update the value of needsDeploy as part of the mutation or leave its current value unaltered. */
  preserveDeployState?: InputMaybe<Scalars['Boolean']>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateInstancePayload = {
  __typename?: 'UpdateInstancePayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type UpdateIntegrationInput = {
  /** Adds the specified Attachment to the object. */
  addAttachment?: InputMaybe<AttachmentInput>;
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** Specifies the category of the Integration. */
  category?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: InputMaybe<Scalars['ID']>;
  /** The YAML serialized definition of the Integration to import. */
  definition?: InputMaybe<Scalars['String']>;
  /** Additional notes about the Integration. */
  description?: InputMaybe<Scalars['String']>;
  /** Content type of the payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestContentType?: InputMaybe<Scalars['String']>;
  /** A JSON string of key/value pairs that will be sent as headers when testing the endpoint configuration for this Integration. */
  endpointConfigTestHeaders?: InputMaybe<Scalars['String']>;
  /** Data payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestPayload?: InputMaybe<Scalars['String']>;
  /** The Integration of which the IntegrationFlow is a part. */
  flows?: InputMaybe<Array<InputMaybe<InputIntegrationFlow>>>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** The name of the Integration. */
  name?: InputMaybe<Scalars['String']>;
  /** Renames the specified Attachment on the object. */
  removeAttachment?: InputMaybe<AttachmentInput>;
  /** Removes the specified Attachment from the object. */
  renameAttachment?: InputMaybe<AttachmentRenameInput>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars['Boolean']>;
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  templateConfiguration?: InputMaybe<Scalars['String']>;
  /** Config Variables that have been specified for the purposes of testing the Integration. */
  testConfigVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  useAsTemplate?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateIntegrationMarketplaceConfigurationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** Specifies whether an Integration will be available in the Integration Marketplace and if the Integration is deployable by a Customer User. */
  marketplaceConfiguration?: InputMaybe<Scalars['String']>;
  /** The Marketplace Tabs available to Customer Users for configuring this Integration. */
  marketplaceTabConfiguration?: InputMaybe<Scalars['String']>;
  /** Specifies an Overview of the Integration to describe its functionality for use in the Integration Marketplace. */
  overview?: InputMaybe<Scalars['String']>;
};

export type UpdateIntegrationMarketplaceConfigurationPayload = {
  __typename?: 'UpdateIntegrationMarketplaceConfigurationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type UpdateIntegrationPayload = {
  __typename?: 'UpdateIntegrationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type UpdateIntegrationVersionAvailabilityInput = {
  /** Flag the Integration version as available or not */
  available: Scalars['Boolean'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars['ID']>;
};

export type UpdateIntegrationVersionAvailabilityPayload = {
  __typename?: 'UpdateIntegrationVersionAvailabilityPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type UpdateOAuth2ConnectionInput = {
  /** The OAuth2 access token to use for the Connection. */
  accessToken?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** The context to use for the Connection. Completely replaces any existing value for context on the Connection. */
  context?: InputMaybe<Scalars['String']>;
  /** The number of seconds until the token is expired and a refresh must occur for the Connection. */
  expiresIn?: InputMaybe<Scalars['Int']>;
  /** The ID of the InstanceConfigVariable to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The timestamp at which the next refresh attempt will occur for the Connection. */
  refreshAt?: InputMaybe<Scalars['DateTime']>;
  /** The OAuth2 refresh token to use for the Connection. */
  refreshToken?: InputMaybe<Scalars['String']>;
  /** The status to use for the Connection. */
  status?: InputMaybe<Scalars['String']>;
  /** The type of OAuth2 token to use for the Connection. */
  tokenType?: InputMaybe<Scalars['String']>;
};

export type UpdateOAuth2ConnectionPayload = {
  __typename?: 'UpdateOAuth2ConnectionPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  instanceConfigVariable?: Maybe<InstanceConfigVariable>;
};

export type UpdateOrganizationInput = {
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  featureFlags?: InputMaybe<Scalars['String']>;
  /** The ID of the Organization to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Display name of the Organization's Marketplace. */
  marketplaceName?: InputMaybe<Scalars['String']>;
  /** The unique name of the Organization. */
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateOrganizationPayload = {
  __typename?: 'UpdateOrganizationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  organization?: Maybe<Organization>;
};

export type UpdateThemeInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** A list of inputs that describe the colors used in the theme. */
  colors?: InputMaybe<Array<InputMaybe<ThemeColorInput>>>;
  /** The ID of the Theme to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** A list of inputs that describe the properties used in the theme. */
  properties?: InputMaybe<Array<InputMaybe<ThemePropertyInput>>>;
};

export type UpdateThemePayload = {
  __typename?: 'UpdateThemePayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  theme?: Maybe<Theme>;
};

export type UpdateUserInput = {
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Designates whether the User has dark mode activated or not. */
  darkMode?: InputMaybe<Scalars['Boolean']>;
  /** Designates whether dark mode should be derived from the operating system. */
  darkModeSyncWithOs?: InputMaybe<Scalars['Boolean']>;
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars['String']>;
  featureFlags?: InputMaybe<Scalars['String']>;
  /** The ID of the User to mutate. */
  id?: InputMaybe<Scalars['ID']>;
  /** The user's preferred name. */
  name?: InputMaybe<Scalars['String']>;
  /** The preferred contact phone number for the User. */
  phone?: InputMaybe<Scalars['String']>;
  /** The role to associate with the User. */
  role?: InputMaybe<Scalars['ID']>;
};

export type UpdateUserPayload = {
  __typename?: 'UpdateUserPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

/** Represents the collection of information necessary to upload media file. */
export type UploadMedia = {
  __typename?: 'UploadMedia';
  /** Contains any error message that occurred as part of generating the pre-signed URL. */
  error?: Maybe<Scalars['String']>;
  /** The URL where the file is located after being uploaded. */
  objectUrl?: Maybe<Scalars['String']>;
  /** The pre-signed URL to which the file should be uploaded. */
  uploadUrl?: Maybe<Scalars['String']>;
};

/**
 * Represents a user account. A User may belong to an Organization directly or
 * belong to a Customer, which itself belongs to an Organization.
 */
export type User = Node & {
  __typename?: 'User';
  /** Specifies whether the signed-in User can change the Role of the User. */
  allowChangeRoles: Scalars['Boolean'];
  /** Specifies whether the signed-in User can remove the User. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the User. */
  allowUpdate: Scalars['Boolean'];
  /** The URL for the main avatar image that is displayed in Prismatic. */
  appAvatarUrl?: Maybe<Scalars['String']>;
  /** The app name displayed in Prismatic. */
  appName: Scalars['String'];
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** The Customer the user belongs to, if any. If this is NULL then Organization will be specified. */
  customer?: Maybe<Customer>;
  /** Designates whether the User has dark mode activated or not. */
  darkMode: Scalars['Boolean'];
  /** Designates whether dark mode should be derived from the operating system. */
  darkModeSyncWithOs: Scalars['Boolean'];
  /** The date the User was created. */
  dateJoined: Scalars['DateTime'];
  /** The email address associated with the User. */
  email: Scalars['String'];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: Maybe<Scalars['String']>;
  featureFlags: Scalars['JSONString'];
  /** The ID of the object */
  id: Scalars['ID'];
  /** The name displayed for the Marketplace. */
  marketplaceName: Scalars['String'];
  /** The user's preferred name. */
  name: Scalars['String'];
  /** The Organization that the User belongs to, if any. If this is NULL then Customer will be specified. */
  org?: Maybe<Organization>;
  /** The preferred contact phone number for the User. */
  phone: Scalars['String'];
  /** The Role associated with the User which determines its permissions. */
  role: Role;
};

/** Represents a Relay Connection to a collection of User objects. */
export type UserConnection = {
  __typename?: 'UserConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<User>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related User object and a cursor for pagination. */
export type UserEdge = {
  __typename?: 'UserEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<User>;
};

/** Provides dynamic user-driven config values to satisfy Required Config Variables of an Instance. */
export type UserLevelConfig = Node & {
  __typename?: 'UserLevelConfig';
  /** Specifies whether the signed-in User can remove the UserLevelConfig. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the UserLevelConfig. */
  allowUpdate: Scalars['Boolean'];
  /** The Dynamic Config with which the Config Variable is associated. */
  configVariables: UserLevelConfigVariableConnection;
  /** The timestamp at which the object was created. */
  createdAt: Scalars['DateTime'];
  flowConfigs: UserLevelFlowConfigConnection;
  /** The ID of the object */
  id: Scalars['ID'];
  /** The Instance with which the User Level Config is associated. */
  instance: Instance;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars['DateTime'];
  /** The User that owns the User Level Config. */
  user: User;
};


/** Provides dynamic user-driven config values to satisfy Required Config Variables of an Instance. */
export type UserLevelConfigConfigVariablesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  config?: InputMaybe<Scalars['ID']>;
  config_Instance?: InputMaybe<Scalars['ID']>;
  config_User?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<Scalars['String']>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


/** Provides dynamic user-driven config values to satisfy Required Config Variables of an Instance. */
export type UserLevelConfigFlowConfigsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

/** Represents a Relay Connection to a collection of UserLevelConfig objects. */
export type UserLevelConfigConnection = {
  __typename?: 'UserLevelConfigConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserLevelConfigEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<UserLevelConfig>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related UserLevelConfig object and a cursor for pagination. */
export type UserLevelConfigEdge = {
  __typename?: 'UserLevelConfigEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<UserLevelConfig>;
};

/** Allows specifying which field and direction to order by. */
export type UserLevelConfigOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: UserLevelConfigOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum UserLevelConfigOrderField {
  CreatedAt = 'CREATED_AT',
  Email = 'EMAIL',
  ExternalId = 'EXTERNAL_ID',
  Name = 'NAME',
  UpdatedAt = 'UPDATED_AT'
}

/**
 * Associates specific values to the Dynamic Config to satisfy Required Config Variables
 * of the related Instance.
 */
export type UserLevelConfigVariable = Node & {
  __typename?: 'UserLevelConfigVariable';
  /** Specifies whether the signed-in User can remove the UserLevelConfigVariable. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the UserLevelConfigVariable. */
  allowUpdate: Scalars['Boolean'];
  /** The Authorize URL of this Config Variable if associated with an OAuth 2.0 Connection. */
  authorizeUrl?: Maybe<Scalars['String']>;
  /** The Dynamic Config with which the Config Variable is associated. */
  config: UserLevelConfig;
  /** The ID of the object */
  id: Scalars['ID'];
  inputs?: Maybe<ExpressionConnection>;
  /** The UserLevelConfigVariable which relates to the Log entry. */
  logs: LogConnection;
  /** Contains arbitrary metadata about this Config Var. */
  meta?: Maybe<Scalars['JSONString']>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars['DateTime']>;
  /** The Required Config Variable that is satisfied with the value of this Dynamic Config Variable. */
  requiredConfigVariable: RequiredConfigVariable;
  /** The schedule type to show in the UI when the Config Var uses the 'schedule' dataType. */
  scheduleType?: Maybe<UserLevelConfigVariableScheduleType>;
  /** Status indicating if this Connection is working as expected or encountering issues. */
  status?: Maybe<UserLevelConfigVariableStatus>;
  /** An optional timezone property for when the Config Var uses the 'schedule' dataType. */
  timeZone?: Maybe<Scalars['String']>;
  /** The value for the Required Config Variable that becomes part of the Instance definition. */
  value?: Maybe<Scalars['String']>;
};


/**
 * Associates specific values to the Dynamic Config to satisfy Required Config Variables
 * of the related Instance.
 */
export type UserLevelConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  visibleToCustomerDeployer?: InputMaybe<Scalars['Boolean']>;
  visibleToOrgDeployer?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Associates specific values to the Dynamic Config to satisfy Required Config Variables
 * of the related Instance.
 */
export type UserLevelConfigVariableLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  configVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
  executionResult?: InputMaybe<Scalars['ID']>;
  executionResult_IsTestExecution?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  flow?: InputMaybe<Scalars['ID']>;
  flowConfig?: InputMaybe<Scalars['ID']>;
  flowConfig_Flow?: InputMaybe<Scalars['ID']>;
  instance?: InputMaybe<Scalars['ID']>;
  instance_Customer?: InputMaybe<Scalars['ID']>;
  instance_Integration?: InputMaybe<Scalars['ID']>;
  instance_IsSystem?: InputMaybe<Scalars['Boolean']>;
  integration?: InputMaybe<Scalars['ID']>;
  integration_VersionSequenceId?: InputMaybe<Scalars['UUID']>;
  last?: InputMaybe<Scalars['Int']>;
  message_Icontains?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LogOrder>;
  severity?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars['DateTime']>;
  timestamp_Lte?: InputMaybe<Scalars['DateTime']>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars['Boolean']>;
};

/** Represents a Relay Connection to a collection of UserLevelConfigVariable objects. */
export type UserLevelConfigVariableConnection = {
  __typename?: 'UserLevelConfigVariableConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserLevelConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<UserLevelConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related UserLevelConfigVariable object and a cursor for pagination. */
export type UserLevelConfigVariableEdge = {
  __typename?: 'UserLevelConfigVariableEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<UserLevelConfigVariable>;
};

/** An enumeration. */
export enum UserLevelConfigVariableScheduleType {
  /** Custom */
  Custom = 'CUSTOM',
  /** Day */
  Day = 'DAY',
  /** Hour */
  Hour = 'HOUR',
  /** Minute */
  Minute = 'MINUTE',
  /** None */
  None = 'NONE',
  /** Week */
  Week = 'WEEK'
}

/** An enumeration. */
export enum UserLevelConfigVariableStatus {
  /** active */
  Active = 'ACTIVE',
  /** error */
  Error = 'ERROR',
  /** pending */
  Pending = 'PENDING'
}

/** Represents the configuration options for a particular User Level Config and Instance Flow Config pair. */
export type UserLevelFlowConfig = Node & {
  __typename?: 'UserLevelFlowConfig';
  /** Specifies whether the signed-in User can remove the UserLevelFlowConfig. */
  allowRemove: Scalars['Boolean'];
  /** Specifies whether the signed-in User can update the UserLevelFlowConfig. */
  allowUpdate: Scalars['Boolean'];
  /** The ID of the object */
  id: Scalars['ID'];
  instanceFlowConfig: InstanceFlowConfig;
  userLevelConfig: UserLevelConfig;
  /** The URL of the endpoint that triggers execution of the UserLevelFlowConfig. */
  webhookUrl: Scalars['String'];
};

/** Represents a Relay Connection to a collection of UserLevelFlowConfig objects. */
export type UserLevelFlowConfigConnection = {
  __typename?: 'UserLevelFlowConfigConnection';
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserLevelFlowConfigEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<UserLevelFlowConfig>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars['Int'];
};

/** A Relay edge to a related UserLevelFlowConfig object and a cursor for pagination. */
export type UserLevelFlowConfigEdge = {
  __typename?: 'UserLevelFlowConfigEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The related object at the end of the edge. */
  node?: Maybe<UserLevelFlowConfig>;
};

/** Allows specifying which field and direction to order by. */
export type UserOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: UserOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum UserOrderField {
  Email = 'EMAIL',
  Name = 'NAME'
}

/** Represents a specific version of an object that implements the Prismatic versioning protocol. */
export type Version = Node & {
  __typename?: 'Version';
  /** Additional commentary/description of this Version. */
  comment?: Maybe<Scalars['String']>;
  /** The ID of the object */
  id: Scalars['ID'];
  /** Specifies whether the Version is available for use. */
  isAvailable?: Maybe<Scalars['Boolean']>;
  /** The timestamp when the Version was published. */
  publishedAt: Scalars['DateTime'];
  /** User that published this Version. */
  publishedBy?: Maybe<User>;
  /** The sequential number that corresponds to the Version. */
  versionNumber?: Maybe<Scalars['Int']>;
};

/** Represents a Relay Connection to a collection of Version objects. */
export type VersionConnection = {
  __typename?: 'VersionConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<VersionEdge>>;
  /** List of nodes in this connection */
  nodes: Array<Maybe<Version>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of versions */
  totalCount: Scalars['Int'];
};

/** A Relay edge containing a `Version` and its cursor. */
export type VersionEdge = {
  __typename?: 'VersionEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Version>;
};

/** Allows specifying which field and direction to order by. */
export type VersionOrder = {
  /** The direction to order by. */
  direction: VersionOrderDirection;
  /** The field to order by. */
  field: VersionOrderField;
};

/** An enumeration. */
export enum VersionOrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Represents the fields by which collections of the related type may be ordered. */
export enum VersionOrderField {
  PublishedAt = 'PUBLISHED_AT',
  PublishedBy = 'PUBLISHED_BY',
  VersionNumber = 'VERSION_NUMBER'
}

export type CheckIfInstanceNameExistsQueryVariables = Exact<{
  customerId: Scalars['ID'];
  name: Scalars['String'];
}>;


export type CheckIfInstanceNameExistsQuery = { __typename?: 'RootQuery', instances: { __typename: 'InstanceConnection', nodes: Array<{ __typename: 'Instance', id: string, name: string } | null> } };

export type DeployInstanceMutationVariables = Exact<{
  instanceId: Scalars['ID'];
}>;


export type DeployInstanceMutation = { __typename?: 'RootMutation', deployInstance?: { __typename: 'DeployInstancePayload', errors: Array<{ __typename: 'ErrorType', field: string, messages: Array<string> }>, instance?: { __typename: 'Instance', id: string, name: string, customer: { __typename: 'Customer', id: string, name: string }, integration: { __typename: 'Integration', id: string, name: string, versionNumber: number } } | null } | null };

export type GetIntegrationQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetIntegrationQuery = { __typename?: 'RootQuery', integration?: { __typename?: 'Integration', id: string, name: string, description?: string | null } | null };

export type CreateInstanceMutationVariables = Exact<{
  integrationId: Scalars['ID'];
  customerId: Scalars['ID'];
  name: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
  configVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>> | InputMaybe<InputInstanceConfigVariable>>;
}>;


export type CreateInstanceMutation = { __typename?: 'RootMutation', createInstance?: { __typename: 'CreateInstancePayload', instance?: { __typename: 'Instance', id: string, name: string, description: string, labels?: Array<string> | null, customer: { __typename: 'Customer', id: string, name: string }, integration: { __typename: 'Integration', id: string, name: string, versionNumber: number }, configVariables: { __typename?: 'InstanceConfigVariableConnection', nodes: Array<{ __typename?: 'InstanceConfigVariable', id: string, authorizeUrl?: string | null, status?: InstanceConfigVariableStatus | null, value?: string | null, requiredConfigVariable: { __typename?: 'RequiredConfigVariable', dataType: RequiredConfigVariableDataType } } | null> } } | null, errors: Array<{ __typename: 'ErrorType', field: string, messages: Array<string> }> } | null };

export type GetMarketplaceIntegrationQueryVariables = Exact<{
  integrationId: Scalars['ID'];
}>;


export type GetMarketplaceIntegrationQuery = { __typename?: 'RootQuery', marketplaceIntegration?: { __typename?: 'Integration', id: string, name: string, description?: string | null, isCustomerDeployable?: boolean | null, versionIsAvailable: boolean, versionIsLatest: boolean, versionNumber: number, versionComment?: string | null, versionCreatedAt?: any | null } | null };

export type GetMarketplaceIntegrationByNameQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
}>;


export type GetMarketplaceIntegrationByNameQuery = { __typename?: 'RootQuery', marketplaceIntegrations: { __typename?: 'IntegrationConnection', nodes: Array<{ __typename?: 'Integration', id: string, name: string, versionNumber: number } | null> } };

export type GetUserInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserInfoQuery = { __typename?: 'RootQuery', authenticatedUser: (
    { __typename: 'User' }
    & { ' $fragmentRefs'?: { 'UserInfoFragment': UserInfoFragment } }
  ) };

export type UserInfoFragment = { __typename: 'User', id: string, email: string, name: string, avatarUrl?: string | null, appName: string, marketplaceName: string, appAvatarUrl?: string | null, darkMode: boolean, darkModeSyncWithOs: boolean, dateJoined: any, featureFlags: any, org?: { __typename: 'Organization', id: string, name: string, avatarUrl?: string | null, currentPlan: string, overdue: boolean, featureFlags?: any | null, allowExecutionRetryConfig: boolean, allowAddUser: boolean, allowAddCustomer: boolean, allowCustomTheme: boolean, allowConfigureThemes: boolean, allowViewBilling: boolean, allowAddAlertGroup: boolean, allowAddIntegration: boolean, allowAddAlertWebhook: boolean, allowAddCredential: boolean, allowAddExternalLogStream: boolean, allowAddSigningKey: boolean, allowEnableInstance: boolean, allowExecuteInstance: boolean, allowPublishComponent: boolean, allowRemove: boolean, allowUpdate: boolean, allowConfigureEmbedded: boolean, allowConfigureExternalLogStreams: boolean, allowConfigureCredentials: boolean, allowUserLevelConfig: boolean } | null, customer?: { __typename: 'Customer', id: string, name: string, avatarUrl?: string | null, allowAddUser: boolean, allowRemove: boolean, allowUpdate: boolean, allowConfigureCredentials: boolean, allowAddInstance: boolean, externalId?: string | null, org: { __typename: 'Organization', id: string } } | null, role: { __typename: 'Role', id: string, name: string } } & { ' $fragmentName'?: 'UserInfoFragment' };

export const UserInfoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"userInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"appName"}},{"kind":"Field","name":{"kind":"Name","value":"marketplaceName"}},{"kind":"Field","name":{"kind":"Name","value":"appAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"darkMode"}},{"kind":"Field","name":{"kind":"Name","value":"darkModeSyncWithOs"}},{"kind":"Field","name":{"kind":"Name","value":"dateJoined"}},{"kind":"Field","name":{"kind":"Name","value":"featureFlags"}},{"kind":"Field","name":{"kind":"Name","value":"org"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"currentPlan"}},{"kind":"Field","name":{"kind":"Name","value":"overdue"}},{"kind":"Field","name":{"kind":"Name","value":"featureFlags"}},{"kind":"Field","name":{"kind":"Name","value":"allowExecutionRetryConfig"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddUser"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"allowCustomTheme"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureThemes"}},{"kind":"Field","name":{"kind":"Name","value":"allowViewBilling"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddAlertGroup"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddIntegration"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddAlertWebhook"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddCredential"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddExternalLogStream"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddSigningKey"}},{"kind":"Field","name":{"kind":"Name","value":"allowEnableInstance"}},{"kind":"Field","name":{"kind":"Name","value":"allowExecuteInstance"}},{"kind":"Field","name":{"kind":"Name","value":"allowPublishComponent"}},{"kind":"Field","name":{"kind":"Name","value":"allowRemove"}},{"kind":"Field","name":{"kind":"Name","value":"allowUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureEmbedded"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureExternalLogStreams"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureCredentials"}},{"kind":"Field","name":{"kind":"Name","value":"allowUserLevelConfig"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"org"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddUser"}},{"kind":"Field","name":{"kind":"Name","value":"allowRemove"}},{"kind":"Field","name":{"kind":"Name","value":"allowUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureCredentials"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddInstance"}},{"kind":"Field","name":{"kind":"Name","value":"externalId"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<UserInfoFragment, unknown>;
export const CheckIfInstanceNameExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"checkIfInstanceNameExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name_Icontains"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"customer"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<CheckIfInstanceNameExistsQuery, CheckIfInstanceNameExistsQueryVariables>;
export const DeployInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deployInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"messages"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"instance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"integration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<DeployInstanceMutation, DeployInstanceMutationVariables>;
export const GetIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"integration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetIntegrationQuery, GetIntegrationQueryVariables>;
export const CreateInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"integrationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"labels"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"configVariables"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputInstanceConfigVariable"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"labels"},"value":{"kind":"Variable","name":{"kind":"Name","value":"labels"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"integration"},"value":{"kind":"Variable","name":{"kind":"Name","value":"integrationId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"customer"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"configVariables"},"value":{"kind":"Variable","name":{"kind":"Name","value":"configVariables"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"integration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"configVariables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"authorizeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"requiredConfigVariable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"messages"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<CreateInstanceMutation, CreateInstanceMutationVariables>;
export const GetMarketplaceIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getMarketplaceIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"integrationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketplaceIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"integrationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isCustomerDeployable"}},{"kind":"Field","name":{"kind":"Name","value":"versionIsAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"versionIsLatest"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"versionComment"}},{"kind":"Field","name":{"kind":"Name","value":"versionCreatedAt"}}]}}]}}]} as unknown as DocumentNode<GetMarketplaceIntegrationQuery, GetMarketplaceIntegrationQueryVariables>;
export const GetMarketplaceIntegrationByNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getMarketplaceIntegrationByName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketplaceIntegrations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}}]}}]}}]}}]} as unknown as DocumentNode<GetMarketplaceIntegrationByNameQuery, GetMarketplaceIntegrationByNameQueryVariables>;
export const GetUserInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getUserInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"userInfo"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"userInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"appName"}},{"kind":"Field","name":{"kind":"Name","value":"marketplaceName"}},{"kind":"Field","name":{"kind":"Name","value":"appAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"darkMode"}},{"kind":"Field","name":{"kind":"Name","value":"darkModeSyncWithOs"}},{"kind":"Field","name":{"kind":"Name","value":"dateJoined"}},{"kind":"Field","name":{"kind":"Name","value":"featureFlags"}},{"kind":"Field","name":{"kind":"Name","value":"org"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"currentPlan"}},{"kind":"Field","name":{"kind":"Name","value":"overdue"}},{"kind":"Field","name":{"kind":"Name","value":"featureFlags"}},{"kind":"Field","name":{"kind":"Name","value":"allowExecutionRetryConfig"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddUser"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"allowCustomTheme"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureThemes"}},{"kind":"Field","name":{"kind":"Name","value":"allowViewBilling"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddAlertGroup"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddIntegration"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddAlertWebhook"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddCredential"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddExternalLogStream"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddSigningKey"}},{"kind":"Field","name":{"kind":"Name","value":"allowEnableInstance"}},{"kind":"Field","name":{"kind":"Name","value":"allowExecuteInstance"}},{"kind":"Field","name":{"kind":"Name","value":"allowPublishComponent"}},{"kind":"Field","name":{"kind":"Name","value":"allowRemove"}},{"kind":"Field","name":{"kind":"Name","value":"allowUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureEmbedded"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureExternalLogStreams"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureCredentials"}},{"kind":"Field","name":{"kind":"Name","value":"allowUserLevelConfig"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"org"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddUser"}},{"kind":"Field","name":{"kind":"Name","value":"allowRemove"}},{"kind":"Field","name":{"kind":"Name","value":"allowUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"allowConfigureCredentials"}},{"kind":"Field","name":{"kind":"Name","value":"allowAddInstance"}},{"kind":"Field","name":{"kind":"Name","value":"externalId"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<GetUserInfoQuery, GetUserInfoQueryVariables>;