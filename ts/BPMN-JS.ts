export interface ModdleElement {
    //$attrs: Object; // Unused...
    //count: number; // Unused...
    dataInputAssociations?: Array<DataInputAssociation>;
    dataOutputAssociations?: Array<DataOutputAssociation>;
    default?: ModdleElement; // Exclusive/inclusive gateway default exit...
    eventDefinitions?: Array<ModdleElement>;
    id: string;
    incoming?: Array<ModdleElement>;
    name?: string;
    outgoing?: Array<ModdleElement>;
    //parallelMultiple: boolean; // Unused...
    $parent: Process; // Used to compute boundary events...
    rootElements?: Array<ModdleElement>;
    sourceRef?: ModdleElement; // 'bpmn:sequenceFlow' only? -> NO!
    targetRef?: ModdleElement; // 'bpmn:sequenceFlow' only? -> NO!
    $type: string;
}

export interface Activity extends ModdleElement {
    isForCompensation?: boolean;
    triggeredByEvent?: boolean;
}

export interface Association extends ModdleElement {
    associationDirection?: string;
}

export interface Boundary_event extends Event {
    attachedToRef: Activity;
}

export interface Collaboration extends ModdleElement {
    messageFlows?: Array<Message_flow>;
    participants: Array<Participant>;
}

export interface DataObject extends ModdleElement {
}

export interface DataObjectReference extends ModdleElement {
    dataObjectRef: DataObject;
}

export interface DataInputAssociation extends Association {
    targetRef: DataObjectReference;
}

export interface DataOutputAssociation extends Association {
    targetRef: DataObjectReference;
}

export interface Event extends ModdleElement {
    cancelActivity?: boolean;
    isInterrupting?: boolean;
}

export interface Event_based_gateway extends ModdleElement {
    eventGatewayType?: string; // "Exclusive" versus "Parallel"
    instantiate?: boolean; // "Parallel" => "true" according to the BPMN spec. ver. 2.0.2?
}

export type Flow_object = Activity | Event | Gateway;

export interface Gateway extends ModdleElement {
    gatewayDirection: string; // 'Diverging', 'Unspecified'
}

export interface Gateway_FORK extends Gateway {
    incoming: Array<ModdleElement>;
    outgoing: Array<ModdleElement>;
}

export interface Gateway_JOIN extends Gateway {
    incoming: Array<ModdleElement>;
    outgoing: Array<ModdleElement>;
}

export interface Message_flow extends ModdleElement {
}

export interface Participant extends ModdleElement {
    processRef: Process;
}

export interface Process extends Activity {
    // '$parent.$type === bpmn:Definitions'
    artifacts?: Array<Association>;
    flowElements: Array<ModdleElement>;
}

export interface Sequence_flow extends ModdleElement {
}

