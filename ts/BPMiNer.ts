import {
    Activity,
    Association,
    Boundary_event,
    Collaboration,
    DataObject, DataObjectReference, DataInputAssociation, DataOutputAssociation,
    Event,
    Event_based_gateway,
    Flow_object,
    Gateway, Gateway_FORK, Gateway_JOIN,
    Message_flow,
    ModdleElement,
    Process,
    Sequence_flow
} from "./BPMN-JS";
import {SCION} from "./SCION-CORE";
import Fork = SCION.Fork;

declare const BpmnModdle: any;
declare const scion: any;
declare const tippy: any;

/** WebPack configuration (this code does not work in the browser) */
// import BpmnModdle from "bpmn-moddle"; // "bpmn-moddle.d.ts" required
// import * as scion from "scion-core"; // "scion-core.d.ts" required
// import tippy from 'tippy.js';
// require('tippy.js/dist/tippy.css');
// require("../css/BPMiNer.css");
// require("../css/LiveBPMN.css");
/** End of WebPack configuration */

/**
 * Danger: bpmn-js capitalizes letters, e.g., 'bpmn:sequenceFlow' in a source XML file
 * becomes 'bpmn:SequenceFlow' at run-time!
 */

enum Validation {
    Activity_as_end_point = "Activity acts as end point",
    Activity_as_start_point = "Activity acts as start point",
    Activity_implicit_FORK_parallelism = "Activity with implicit FORK parallelism",
    Activity_suspicious_JOIN_parallelism = "Activity with suspicious JOIN parallelism",
    Activity_Unknown = "Activity type isn't supported or activity configuration is unknown",

    Boundary_event_non_executable_FORK_parallelism = "Boundary event with non-executable FORK parallelism",
    Boundary_event_with_incoming_flow = "Boundary event with 'incoming' seq. flow",
    End_event_with_outgoing_flow = "End event with 'outgoing' seq. flow(s)",
    End_event_suspicious_JOIN_parallelism = "End event with suspicious JOIN parallelism",
    Intermediate_event_non_executable_FORK_parallelism = "Intermediate event with non-executable FORK parallelism",
    Intermediate_event_suspicious_JOIN_parallelism = "Intermediate event with suspicious JOIN parallelism",
    Start_event_non_executable_FORK_parallelism = "Start event with non-executable FORK parallelism",
    Start_event_with_incoming_flow = "Start event with 'incoming' seq. flow",
    Event_Unknown = "Event type isn't supported or event configuration is unknown",

    Event_based_gateway_with_inappropriate_outgoing_flow_object = "Event-based gateway outgoing flow objects are 'Conditional', 'Message', 'Signal', 'Timer' events, or 'ReceiveTask'",
    Event_based_gateway_with_less_than_one_outgoing_flow = "Event-based gateway with less than one 'outgoing' flow",
    Gateway_neither_FORK_nor_JOIN = "Neither *FORK* nor *JOIN* for exclusive/inclusive/parallel gateway",
    Gateway_recursive_parallelism = "Recursive parallelism for parallel gateway",
    Gateway_Unknown = "Gateway type isn't supported or gateway configuration is unknown",

    Loopback = "Loopback",
    No_start_point = "No start point (event, activity or event-based gateway)",
    Reentrance = "Reentrance"
}

interface Activity_status {
    basic_type: Activity_type;
    type?: Activity_type;
    validation: Set<Validation>;
}

enum Activity_type {
    BPMN_BusinessRuleTask = "bpmn:BusinessRuleTask",
    BPMN_BusinessRuleTaskBOUNDARY_EVENTS = "bpmn:BusinessRuleTask@BOUNDARY_EVENTS",
    BPMN_CallActivity = "bpmn:CallActivity",
    BPMN_CallActivityBOUNDARY_EVENTS = "bpmn:CallActivity@BOUNDARY_EVENTS",
    BPMN_ManualTask = "bpmn:ManualTask",
    BPMN_ManualTaskBOUNDARY_EVENTS = "bpmn:ManualTask@BOUNDARY_EVENTS",
    BPMN_ReceiveTask = "bpmn:ReceiveTask",
    BPMN_ReceiveTaskBOUNDARY_EVENTS = "bpmn:ReceiveTask@BOUNDARY_EVENTS",
    BPMN_ScriptTask = "bpmn:ScriptTask",
    BPMN_ScriptTaskBOUNDARY_EVENTS = "bpmn:ScriptTask@BOUNDARY_EVENTS",
    BPMN_SendTask = "bpmn:SendTask",
    BPMN_SendTaskBOUNDARY_EVENTS = "bpmn:SendTask@BOUNDARY_EVENTS",
    BPMN_ServiceTask = "bpmn:ServiceTask",
    BPMN_ServiceTaskBOUNDARY_EVENTS = "bpmn:ServiceTask@BOUNDARY_EVENTS",
    BPMN_SubProcess = "bpmn:SubProcess",
    BPMN_SubProcessBOUNDARY_EVENTS = "bpmn:SubProcess@BOUNDARY_EVENTS",
    BPMN_Task = "bpmn:Task", // Abstract task...
    BPMN_TaskBOUNDARY_EVENTS = "bpmn:Task@BOUNDARY_EVENTS", // Abstract task...
    BPMN_Transaction = "bpmn:Transaction",
    BPMN_TransactionBOUNDARY_EVENTS = "bpmn:Transaction@BOUNDARY_EVENTS",
    BPMN_UserTask = "bpmn:UserTask",
    BPMN_UserTaskBOUNDARY_EVENTS = "bpmn:UserTask@BOUNDARY_EVENTS"
}

enum Data_type {
    BPMN_Association = "bpmn:Association",
    BPMN_DataInputAssociation = "bpmn:DataInputAssociation",
    BPMN_DataObject = "bpmn:DataObject",
    BPMN_DataObjectReference = "bpmn:DataObjectReference",
    BPMN_DataOutputAssociation = "bpmn:DataOutputAssociation",
    BPMN_DataStoreReference = "bpmn:DataStoreReference"
}

enum Diagram_type {
    BPMN_Collaboration = "bpmn:Collaboration",
    BPMN_Process = "bpmn:Process"
}

interface Event_status {
    basic_type: Event_type;
    type?: Event_type;
    validation: Set<Validation>;
}

enum Event_type {
    BPMN_BoundaryEvent = "bpmn:BoundaryEvent",
    BPMN_BoundaryCancelEvent = "bpmn:BoundaryEvent@bpmn:CancelEventDefinition", // Only interrupting...
    BPMN_BoundaryCompensateEvent = "bpmn:BoundaryEvent@bpmn:CompensateEventDefinition", // Only non-interrupting...
    BPMN_BoundaryConditionalEvent = "bpmn:BoundaryEvent@bpmn:ConditionalEventDefinition",
    BPMN_BoundaryErrorEvent = "bpmn:BoundaryEvent@bpmn:ErrorEventDefinition", // Only interrupting...
    BPMN_BoundaryEscalationEvent = "bpmn:BoundaryEvent@bpmn:EscalationEventDefinition",
    BPMN_BoundaryMessageEvent = "bpmn:BoundaryEvent@bpmn:MessageEventDefinition",
    BPMN_BoundarySignalEvent = "bpmn:BoundaryEvent@bpmn:SignalEventDefinition",
    BPMN_BoundaryTimerEvent = "bpmn:BoundaryEvent@bpmn:TimerEventDefinition",
    /** END */
    BPMN_EndCancelEvent = "bpmn:EndEvent@bpmn:CancelEventDefinition",
    BPMN_EndCompensateEvent = "bpmn:EndEvent@bpmn:CompensateEventDefinition",
    BPMN_EndErrorEvent = "bpmn:EndEvent@bpmn:ErrorEventDefinition",
    BPMN_EndEscalationEvent = "bpmn:EndEvent@bpmn:EscalationEventDefinition",
    BPMN_EndEvent = "bpmn:EndEvent",
    BPMN_EndMessageEvent = "bpmn:EndEvent@bpmn:MessageEventDefinition",
    BPMN_EndSignalEvent = "bpmn:EndEvent@bpmn:SignalEventDefinition",
    BPMN_EndTerminateEvent = "bpmn:EndEvent@bpmn:TerminateEventDefinition",
    /** INTERMEDIATE CATCH */
    BPMN_IntermediateCatchConditionalEvent = "bpmn:IntermediateCatchEvent@bpmn:ConditionalEventDefinition",
    BPMN_IntermediateCatchEscalationEvent = "bpmn:IntermediateCatchEvent@bpmn:EscalationEventDefinition",
    BPMN_IntermediateCatchEvent = "bpmn:IntermediateCatchEvent",
    // 'incoming' must be empty, similar to "start event":
    BPMN_IntermediateCatchLinkEvent = "bpmn:IntermediateCatchEvent@bpmn:LinkEventDefinition",
    BPMN_IntermediateCatchMessageEvent = "bpmn:IntermediateCatchEvent@bpmn:MessageEventDefinition",
    BPMN_IntermediateCatchSignalEvent = "bpmn:IntermediateCatchEvent@bpmn:SignalEventDefinition",
    BPMN_IntermediateCatchTimerEvent = "bpmn:IntermediateCatchEvent@bpmn:TimerEventDefinition",
    /** INTERMEDIATE THROW */
    BPMN_IntermediateThrowCompensateEvent = "bpmn:IntermediateThrowEvent@bpmn:CompensateEventDefinition",
    BPMN_IntermediateThrowEscalationEvent = "bpmn:IntermediateThrowEvent@bpmn:EscalationEventDefinition",
    BPMN_IntermediateThrowEvent = "bpmn:IntermediateThrowEvent",
    BPMN_IntermediateThrowLinkEvent = "bpmn:IntermediateThrowEvent@bpmn:LinkEventDefinition",
    BPMN_IntermediateThrowMessageEvent = "bpmn:IntermediateThrowEvent@bpmn:MessageEventDefinition",
    BPMN_IntermediateThrowSignalEvent = "bpmn:IntermediateThrowEvent@bpmn:SignalEventDefinition",
    /** START */
    BPMN_StartCompensateEvent = "bpmn:StartEvent@bpmn:CompensateEventDefinition", // Event subprocess only!
    BPMN_StartConditionalEvent = "bpmn:StartEvent@bpmn:ConditionalEventDefinition",
    BPMN_StartErrorEvent = "bpmn:StartEvent@bpmn:ErrorEventDefinition", // Event subprocess only!
    BPMN_StartEscalationEvent = "bpmn:StartEvent@bpmn:EscalationEventDefinition", // Event subprocess only!
    BPMN_StartEvent = "bpmn:StartEvent",
    BPMN_StartMessageEvent = "bpmn:StartEvent@bpmn:MessageEventDefinition",
    BPMN_StartSignalEvent = "bpmn:StartEvent@bpmn:SignalEventDefinition",
    BPMN_StartTimerEvent = "bpmn:StartEvent@bpmn:TimerEventDefinition"
}

enum Flow_type {
    BPMN_MessageFlow = "bpmn:MessageFlow",
    BPMN_SequenceFlow = "bpmn:SequenceFlow"
}

interface Gateway_status {
    basic_type: Gateway_type;
    type?: Gateway_type;
    validation: Set<Validation>;
}

enum Gateway_type {
    BPMN_ComplexGateway = "bpmn:ComplexGateway",
    BPMN_ComplexGatewayFORK = "bpmn:ComplexGateway@FORK",
    BPMN_ComplexGatewayJOIN = "bpmn:ComplexGateway@JOIN",
    BPMN_EventBasedGateway = "bpmn:EventBasedGateway",
    BPMN_EventBasedGatewayExclusive = "bpmn:EventBasedGateway@Exclusive",
    BPMN_EventBasedGatewayParallel = "bpmn:EventBasedGateway@Parallel",
    BPMN_ExclusiveGateway = "bpmn:ExclusiveGateway",
    BPMN_ExclusiveGatewayFORK = "bpmn:ExclusiveGateway@FORK",
    BPMN_ExclusiveGatewayJOIN = "bpmn:ExclusiveGateway@JOIN",
    BPMN_InclusiveGateway = "bpmn:InclusiveGateway",
    BPMN_InclusiveGatewayFORK = "bpmn:InclusiveGateway@FORK",
    BPMN_InclusiveGatewayJOIN = "bpmn:InclusiveGateway@JOIN",
    BPMN_ParallelGateway = "bpmn:ParallelGateway",
    BPMN_ParallelGatewayFORK = "bpmn:ParallelGateway@FORK",
    BPMN_ParallelGatewayJOIN = "bpmn:ParallelGateway@JOIN"
}

type FORK = Activity | Gateway | 'JOINABLE';

interface Region_in_parallel extends SCION.State {
    // 'FORK' field is added so that substates can deal with superstates' execution context:
    FORK: FORK; // This is a marker to keep information about what flow object (e.g., gateway) the region in parallel belongs to...
    states: Array<SCION.State>; // Overriding 'states': attribute must exist...
}

export interface Test_case {
    index: number,
    name: string,
    XML?: string
}

export default class BPMiNer {
    // Attention, 'dblclick' crée un bug (ici voulu pour les tests)...
    // Mais il faut remplacer par 'Reload' dans la version de distribution :
    public static readonly Reload = 'dblclick';
    public static readonly Trace = true; // 'false' dans la version de distribution...
    /** From ver. "version": "1.0.1"
     * When loading a new BPMN file, 'window' listeners remain registered.
     * Parsing this new file may create conflicts between registered listeners and the on-creation ones (ids of SVG elements typically).
     * 'window.addEventListener' is then under control by letting the possibility of removing "old" listeners...
     */
    private static readonly _Listeners: Map<string, EventListenerOrEventListenerObject> = new Map;

    private static _Clear_listeners(): void {
        BPMiNer._Listeners.forEach((value: EventListenerOrEventListenerObject, key: string) => window.removeEventListener(key, value));
        BPMiNer._Listeners.clear();
    }

    public static Record_listener(type: string, listener: EventListenerOrEventListenerObject, options?: any): void {
        BPMiNer._Listeners.set(type, listener);
        window.addEventListener(type, listener, options);
    }

    /** End from ver. "version": "1.0.1" */

    public static readonly File_reader = new FileReader();

    public static readonly Drag_and_drop = (): void => {
        // FYI: 'drag', 'dragend' and 'dragstart' are *NEVER* fired when dragged entities come from the OS (compared to draggable entities in the browser having "draggable = true")
        // Corollary: 'setDragImage' won't work here...
        // Mouse events are inhibited when Drag & drop: http://blog.teamtreehouse.com/implementing-native-drag-and-drop
        window.document.body.addEventListener('dragenter', (event: DragEvent) => {
            event.preventDefault();
            event.stopImmediatePropagation();
        }, false);
        // 'preventDefault' in 'dragover' is MANDATORY to later allow 'drop':
        window.document.body.addEventListener('dragover', (event: DragEvent) => {
            event.preventDefault();
            event.stopImmediatePropagation();
        }, false);
        window.document.body.addEventListener('drop', (event: DragEvent) => {
            event.preventDefault();
            event.stopImmediatePropagation();
// Caution: 'event.dataTransfer.types.length === 2' with Firefox while 'event.dataTransfer.types.length === 1' with Chrome
// 'event.dataTransfer.types.length === 7' with Safari!
            if ('dataTransfer' in event) { // 'event.dataTransfer.items' might be 'undefined' for Safari!
                let i = 0;
                while (event.dataTransfer!.items[i].kind !== 'file')
                    i++;
                // Dropped file name (OK with Chrome, Firefox and Safari):
                // window.alert(event.dataTransfer!.items[i].getAsFile()!.name);
                BPMiNer.Set_current_test_case({
                    index: 14,
                    name: event.dataTransfer!.items[i].getAsFile()!.name.substring(0, event.dataTransfer!.items[i].getAsFile()!.name.indexOf("."))
                });
                // Load XML:
                BPMiNer.File_reader.readAsText(event.dataTransfer!.items[i].getAsFile()!); // UTF-8
            } else
                throw new Error("'Drag_and_drop' >> ''dataTransfer' in event', untrue.");
        }, false);
    };

    public static Adjust_tooltip(flow_object: Flow_object, type: string, ergonomics: "'click'" | "'dblclick'"): void {
        const flow_object_as_SVG = BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(flow_object.id));
        const tip = BPMiNer.Tooltips.get(type);
        if ('_tippy' in flow_object_as_SVG && tip) { // Already set...
            let new_ergonomics = tip.replace("'click'", ergonomics);
            new_ergonomics = new_ergonomics.replace("'dblclick'", ergonomics);
            // @ts-ignore
            flow_object_as_SVG._tippy.setContent(new_ergonomics);
        }
    }

    public static Set_tooltip(flow_object: Flow_object, type: string): any {
        const flow_object_as_SVG = BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(flow_object.id));
        const tip = BPMiNer.Tooltips.get(type);
        if ('_tippy' in flow_object_as_SVG && tip) { // Already set...
            // @ts-ignore
            flow_object_as_SVG._tippy.setContent(tip);
            // @ts-ignore
            return flow_object_as_SVG._tippy;
        }
        return tippy(flow_object_as_SVG, {content: tip ? tip : BPMiNer.Tip, theme: "liveBPMN"});
    }

    public static readonly Tip = "'click' on outgoing seq. flow";
    public static readonly Tooltips: Map<string, string> = new Map(
        [
            [Activity_type.BPMN_SubProcess, BPMiNer.Tip],
            [Activity_type.BPMN_SubProcessBOUNDARY_EVENTS, BPMiNer.Tip],
            [Activity_type.BPMN_TransactionBOUNDARY_EVENTS, BPMiNer.Tip],

            [Event_type.BPMN_BoundaryCancelEvent, "Await cancellation or 'dblclick' on seq. flow to bypass reception"],
            [Event_type.BPMN_BoundaryCompensateEvent, "Await compensation"],
            [Event_type.BPMN_BoundaryErrorEvent, "Await error or 'dblclick' on seq. flow to bypass reception"],
            [Event_type.BPMN_BoundaryEscalationEvent, `Await escalation or 'dblclick' on seq. flow to bypass reception`],
            [Event_type.BPMN_BoundaryMessageEvent, "Await message or 'dblclick' on seq. flow to bypass reception"],
            [Event_type.BPMN_BoundarySignalEvent, "Await signal or 'dblclick' on seq. flow to bypass reception"],

            [Event_type.BPMN_EndCancelEvent, "Cancellation sent (process terminated)"],
            [Event_type.BPMN_EndCompensateEvent, "Compensation sent"],
            [Event_type.BPMN_EndErrorEvent, "Error sent (process terminated)"],
            [Event_type.BPMN_EndEscalationEvent, "Escalation sent"],
            [Event_type.BPMN_EndEvent, "End"],
            [Event_type.BPMN_EndMessageEvent, "Message sent"],
            [Event_type.BPMN_EndSignalEvent, "Signal sent"],
            [Event_type.BPMN_EndTerminateEvent, "Process terminated"],

            [Event_type.BPMN_IntermediateCatchEscalationEvent, "Await escalation or 'dblclick' on seq. flow to bypass reception"],
            [Event_type.BPMN_IntermediateCatchLinkEvent, BPMiNer.Tip],
            [Event_type.BPMN_IntermediateCatchMessageEvent, "Await message or 'click' on seq. flow to bypass reception"],
            [Event_type.BPMN_IntermediateCatchSignalEvent, "Await signal or 'dblclick' on seq. flow to bypass reception"],

            [Event_type.BPMN_IntermediateThrowCompensateEvent, "'click' on outgoing seq. flow to send"],
            [Event_type.BPMN_IntermediateThrowEscalationEvent, "'click' on outgoing seq. flow to send"],
            [Event_type.BPMN_IntermediateThrowLinkEvent, "Link sent"],
            [Event_type.BPMN_IntermediateThrowMessageEvent, "'click' on msg flow (if any) or outgoing seq. flow to send"],
            [Event_type.BPMN_IntermediateThrowSignalEvent, "'click' on outgoing seq. flow to send"],

            [Event_type.BPMN_StartCompensateEvent, "Await compensation or 'dblclick' on seq. flow to bypass reception"], // Event subprocess only!
            [Event_type.BPMN_StartErrorEvent, "Await error or 'dblclick' on seq. flow to bypass reception"], // Event subprocess only!
            [Event_type.BPMN_StartEscalationEvent, "Await escalation or 'dblclick' on seq. flow to bypass reception"], // Event subprocess only!
            [Event_type.BPMN_StartMessageEvent, "Await message or 'click' on seq. flow to bypass reception"],
            [Event_type.BPMN_StartSignalEvent, "Await signal or 'dblclick' on seq. flow to bypass reception"],

            [Gateway_type.BPMN_ComplexGatewayFORK as string, "'click' on outgoing seq. flow(s) *BEFORE* clicking on gateway"],
            [Gateway_type.BPMN_InclusiveGatewayFORK as string, "'click' on outgoing seq. flow(s) *BEFORE* clicking on gateway"],
            [Gateway_type.BPMN_EventBasedGatewayExclusive as string, "LiveBPMN"],
            [Gateway_type.BPMN_EventBasedGatewayParallel, "LiveBPMN"],
            [Gateway_type.BPMN_ParallelGatewayFORK, "LiveBPMN"],

            ["Activity_with_default", "'click' on activity to trigger default seq. flow. Otherwise, 'click' on conditional seq. flow"],
            ["ExclusiveGatewayFORK_with_default", "'click' on gateway to trigger default seq. flow. Otherwise, 'click' on non-default seq. flow"],
            ["InclusiveGatewayFORK_with_default", "'click' on gateway to trigger default seq. flow. Otherwise, 'click' on non-default seq. flow(s) *BEFORE* clicking on gateway"],
            ["Receive_Message_Flows", "Await message or 'dblclick' on outgoing seq. flow to bypass reception"],
            ["Receive_No_Message_Flows", "'click' on outgoing seq. flow to receive"], // If no incoming message flows...
            ["Send", "'click' on msg. flow(s) to send or 'dblclick' on outgoing seq. flow to bypass emission"],
            ["Send_", "'click' on outgoing seq. flow to send"], // If no outgoing message flows...
            ["Send__", "'click' on msg. flow(s) to send"], // End message event...
            ["Send___", "'click' on msg. flow(s) to send and/or 'click' on outgoing seq. flow"] // End message event...
        ]
    );

    public static Warn(flow_object: Flow_object, text: string): any {
        return tippy(BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(flow_object.id)), {
            content: text,
            placement: 'right',
            showOnCreate: true,
            theme: "liveBPMN_error"
        });
    }

    /**
     * bpmn.io-js
     */
    /* Methods: fromXML - toXML - create - getType - createAny - getPackage - getPackages - getElementDescriptor - hasType - getPropertyDescriptor - getTypeDescriptor */
    private static readonly _Moddle = new BpmnModdle();
    public static Viewer: any;
    // private static readonly _Overlays = BPMiNer._Viewer.get('overlays'); // https://github.com/bpmn-io/bpmn-js-examples/tree/master/overlays
    // private static _Display_overlays_API(): void { // BPMiNer._Display_overlays_API(); -> get - add - remove - show - hide - clear
    //     const functions = [];
    //     for (const f in BPMiNer._Overlays)
    //         if (typeof BPMiNer._Overlays[f] === "function" && BPMiNer._Overlays.hasOwnProperty(f)) // Inherited functions (with comment) as well...
    //             functions.push(f);
    //     alert(functions.join(" - "));
    // };

    private _XML: Promise<string>;
    get XML() {
        return this._XML;
    }

    public async execute(): Promise<never | void> {
        const XML = await this._XML;
        const { // 'BPMiNer._Moddle.fromXML(XML)' returns an object with field 'rootElement'
            rootElement: model
            // warnings: warnings // Array...
        } = await BPMiNer._Moddle.fromXML(XML);
        const message_flows: Array<Message_flow> = model.rootElements.filter((me: ModdleElement) => me.$type === Diagram_type.BPMN_Collaboration)
            .map((collaboration: Collaboration) => collaboration.messageFlows ? collaboration.messageFlows : new Array)
            .flat();

        if (BPMiNer.Trace) console.assert(window.document.readyState !== 'loading');
        BPMiNer._Clear_listeners(); // 'window.addEventListener' actions from prior BPMN case must be discarded...
        BPMiNer.Viewer.clear();
        await BPMiNer.Viewer.importXML(XML); // Visualization...
        window.dispatchEvent(new Event('fit-viewport'));

        message_flows.map(message_flow => message_flow.id).forEach((message_flow_id: string) => {
            const message_flow_as_SVG: SVGGElement = BPMiNer.Get_SVGGElement(message_flow_id);
            message_flow_as_SVG.classList.add('FLOW');
            message_flow_as_SVG.addEventListener('click', (me: MouseEvent) => window.dispatchEvent(new Event(message_flow_id)));
        });

        model.rootElements!.filter((me: ModdleElement) => me.$type === Diagram_type.BPMN_Process)
            .forEach((process: Process) => { // Static checking:
                process.flowElements.forEach((me: ModdleElement) => {
                    // Check 'me' from a static viewpoint...
                });
                new BPMiNer_process(process, message_flows); // Errors are routed in calling context...
            });
    }

    private async _load(source: string): Promise<string> {
        const response: Response = await window.fetch(source);
        return response.text();
    }

    constructor(readonly source: string, readonly is_XML = false) {
        if (is_XML)
            this._XML = Promise.resolve(source);
        else
            this._XML = this._load(source);
    }

    /**
     * End of bpmn.io-js
     */

    private static readonly _BPMiNer: string = 'BPMiNer';
    private static readonly _BPMiNer_RegExp: RegExp = /(BPMiNer)+$/;
    private static readonly _BPMiNer_RegExp_: RegExp = /(BPMiNer)+/g; // For 'Clean_up'...
    private static readonly _BPMiNer_RegExp__: RegExp = /BPMiNer/g;
    public static readonly BPMiNer_Separator: string = '@';
    public static readonly FORK: 'FORK' = 'FORK';
    public static readonly JOIN: 'JOIN' = 'JOIN';

    /**
     * scion.js
     */
    /* *EMPTY* parallel region is created with id equals to '$generated-state-0', '$generated-state-1'... (see 'Hungry_replete_EXC.bpmn') */
    public static readonly Generated_state = '$generated-state'; // Keep string as is, scion.js requirement!
    public static readonly Parallel: 'exclusive' | 'parallel' = 'parallel'; // Keep string as is, scion.js requirement!

    public static Clean_up_id(id: string): string {
        return id.replace(BPMiNer._BPMiNer_RegExp_, "");
    }

    private static readonly _BOUNDARY_EVENTS = "BOUNDARY_EVENTS";

    public static Compute_activity_type(activity: Activity): Activity_type {
        if (BPMiNer.Get_boundary_events(activity).length > 0)
            return <Activity_type>(activity.$type + BPMiNer.BPMiNer_Separator + BPMiNer._BOUNDARY_EVENTS);
        return <Activity_type>activity.$type;
    }

    public static Compute_event_type(flow_object: Flow_object): Activity_type | Event_type | Gateway_type {
        /**
         * For convenience (link events in particular), one may call this function for flow objects that *ARE NOT* events.
         */
        // Accordingly, this *DOES NOT* apply: 'console.assert(flow_object.$type.includes("Event"), "'Compute_event_type' >> 'flow_object.$type.includes(\"Event\")', untrue.");'
        if ('eventDefinitions' in flow_object) { // Case when 'event.eventDefinitions.length > 1'?
            if (BPMiNer.Trace) console.assert(flow_object.eventDefinitions!.length === 1, "'Compute_event_type' >> 'flow_object.eventDefinitions!.length === 1', untrue.");
            return <Activity_type | Event_type | Gateway_type>(flow_object.$type + BPMiNer.BPMiNer_Separator + flow_object.eventDefinitions![0].$type);
        }
        return <Activity_type | Event_type | Gateway_type>flow_object.$type;
    }

    private static __Compute_execution_path(execution_flow: Sequence_flow, flow_object: ModdleElement): string {
        // See "Weird_.bpmn': starting without neither a start event nor a "simple" (i.e., an activity without boundary events)
        // activity causes problems
        const execution_path: string = BPMiNer.Is_start_activity_(execution_flow) ? "" : BPMiNer.Get_execution_paths(execution_flow.sourceRef!).pop()!;
        if (BPMiNer.Trace) console.assert(execution_path !== undefined, "'__Compute_execution_path' >> 'execution_path !== undefined', untrue.");
        const execution_paths: Array<string> = BPMiNer.Get_execution_paths(flow_object);
        if (execution_paths.indexOf(execution_path + execution_flow.id) === -1) { // New execution path...
            if (flow_object.hasOwnProperty('name') && flow_object.name!.length > 0)
                flow_object.name = BPMiNer.Suffix(flow_object.name!, execution_path!, execution_flow);
            // 'name' attribute is created:
            else flow_object.name = BPMiNer.Suffix(flow_object.id, execution_path!, execution_flow);
            return flow_object.name!.split(BPMiNer.BPMiNer_Separator).pop()!;
        }
        return "";
    }

    public static Compute_execution_path(execution_flow: Sequence_flow, flow_object: ModdleElement, status: Activity_status | Event_status | Gateway_status): void {
        const current_execution_path = BPMiNer.Get_current_execution_path(flow_object);
        const next_execution_path = BPMiNer.__Compute_execution_path(execution_flow, flow_object);
        if (BPMiNer._Is_loopback_(flow_object, execution_flow.sourceRef!)) {
            if (next_execution_path.includes(current_execution_path)
                || current_execution_path !== BPMiNer.Get_name_when_possible(flow_object)) {
                // 'Chemistry.bpmn': "Temp. > z?" 2nd round...
                // 'Evolve_test_software.bpmn': "Evolve software" 2nd round...
                // 'Hungry_eat.bpmn': "Hungry?" 2nd round...
                // 'Hungry_replete_EXC.bpmn': "Hungry?" 2nd round...
                // 'Peekaboo.bpmn': "Peekaboo!" 2nd round...
                status.validation.clear(); // Previous diagnosis is questioning...
                status.validation.add(Validation.Loopback);
                return;
            }
        }
        if (next_execution_path) { // 'next_execution_path' *ISN'T* empty string...
            if (BPMiNer.Is_reentered_(flow_object)) {
                BPMiNer.Reenter(flow_object);
                status.validation.clear(); // Previous diagnosis is questioning...
                status.validation.add(Validation.Reentrance);
            }
            // First reentrance:
            else if (current_execution_path !== BPMiNer.Get_name_when_possible(flow_object)) { // See 'Temp. > z' in 'Chemistry.bpmn'
                BPMiNer.Reenter(flow_object);
                status.validation.clear(); // Previous diagnosis is questioning...
                status.validation.add(Validation.Reentrance);
            }
        } else
            throw new BPMN_error(flow_object, BPMN_error.No_new_detected_execution_path, current_execution_path);
    }

    // For join gateways only:
    public static Compute_execution_path_JOIN(execution_flow: Sequence_flow, status: Gateway_status, states: SCION.State[]) {
        const join_gateway = execution_flow.targetRef!;
        const region_in_parallel = BPMiNer.Get_region_in_parallel(states[states.length - 1]);
        if (!region_in_parallel)
            return;
        const execution_path = BPMiNer.Get_current_execution_path(execution_flow.sourceRef!);
        const execution_paths = BPMiNer.Get_execution_paths(join_gateway);
        let reenter = !(execution_paths.length === 1 && execution_paths[0] === BPMiNer.Get_name_when_possible(join_gateway));
        if (!execution_paths.includes(execution_path)) {
            if (join_gateway.hasOwnProperty('name') && join_gateway.name!.length > 0)
                join_gateway.name += BPMiNer.BPMiNer_Separator + execution_path;
            // 'name' attribute is created:
            else join_gateway.name = BPMiNer.Get_name_when_possible(join_gateway) + BPMiNer.BPMiNer_Separator + execution_path;
            reenter = reenter ? true : reenter; // Let it to 'true' if 'true'...
        } else
            reenter = false;
        if (!BPMiNer.Is_joinable_forked_(region_in_parallel)
            && BPMiNer.Is_reentered_((region_in_parallel.FORK as Gateway))
            && reenter) {
            BPMiNer.Reenter_JOIN(execution_flow);
            status.validation.clear(); // Previous diagnosis is questioning...
            status.validation.add(Validation.Reentrance);
        }
    }

    public static Compute_transitive_closure(flow_object: ModdleElement, transitive_closure: Set<ModdleElement> = new Set): Set<ModdleElement> {
        const boundary_events = BPMiNer.Get_boundary_events(flow_object);
        boundary_events.forEach(boundary_event => {
            transitive_closure.add(boundary_event);
            // Compensation boundary events do not have an 'outgoing' field so '?' instead of '!':
            boundary_event.outgoing?.map(sequence_flow => sequence_flow.targetRef!).forEach(flow_object_ => {
                if (!transitive_closure.has(flow_object_)) {
                    transitive_closure.add(flow_object_);
                    BPMiNer.Compute_transitive_closure(flow_object_, transitive_closure);
                }
            });
        });
        if (!('outgoing' in flow_object)) return transitive_closure;
        flow_object.outgoing!.map(sequence_flow => sequence_flow.targetRef!).forEach(flow_object_ => {
            if (!transitive_closure.has(flow_object_)) {
                transitive_closure.add(flow_object_);
                BPMiNer.Compute_transitive_closure(flow_object_, transitive_closure);
            }
        });
        return transitive_closure;
    }

    public static Create_id_for_non_visual_state_machine_element(id?: string): string;
    public static Create_id_for_non_visual_state_machine_element(prefix: string, suffix: string): string;
    public static Create_id_for_non_visual_state_machine_element(prefix?: string, suffix?: string): never | string {
        if (!prefix)
            throw new Error("'_Create_id_for_non_visual_state_machine_element': " + prefix);
        if (suffix)
            return prefix + BPMiNer.BPMiNer_Separator + suffix;
        return prefix + BPMiNer.BPMiNer_Separator + prefix;
    }

    public static Record_current_test_case(test_case: Test_case): void {
        test_case.index = window.history.state.index;
        test_case.name = window.history.state.name;
        test_case.XML = window.history.state.XML;
    }

    public static Set_current_test_case(test_case: Test_case) {
        window.history.replaceState({index: test_case.index, name: test_case.name, XML: test_case.XML}, "");
    }

    public static Get_boundary_events(flow_object: Readonly<Flow_object>): Array<Boundary_event> {
        if (BPMiNer.Trace) console.assert(flow_object.$parent.$type === Diagram_type.BPMN_Process || BPMiNer.Is_subprocess_(flow_object.$parent), "'_Get_boundary_events_' >> 'flow_object.$parent.$type === Diagram_type.BPMN_Process || BPMiNer.Is_subprocess_(flow_object.$parent)', untrue.");
        return <Array<Boundary_event>>flow_object.$parent.flowElements.filter((flow_object_: ModdleElement) => flow_object_.$type === Event_type.BPMN_BoundaryEvent
            && (flow_object_ as Boundary_event).attachedToRef === flow_object);
    }

    public static Get_communication_pattern(event: Event, status: Event_status | Activity_status): string {
        if (BPMiNer.Get_execution_paths(event)[0] === BPMiNer.Get_original_id(event.id))
            return status.type!.split(BPMiNer.BPMiNer_Separator).pop()!;
        return BPMiNer.Get_name_when_possible(event);
    }

    public static Get_current_execution_path(flow_object: Flow_object): string {
        return BPMiNer.Get_execution_paths(flow_object).pop()!;
    }

    public static Get_execution_paths(flow_object: Flow_object): Array<string> {
        return flow_object.hasOwnProperty('name') && flow_object.name // 'name' must not be empty string...
            ? flow_object.name!.split(BPMiNer.BPMiNer_Separator)
            : new Array(BPMiNer.Get_name_when_possible(flow_object));
    }

    public static Get_initial_flow_object_as_state(region_in_parallel: Region_in_parallel): SCION.State {
        if (BPMiNer.Trace) console.assert(BPMiNer.Is_region_in_parallel_(region_in_parallel), "'Get_initial_flow_object_as_state' >> 'BPMiNer.Is_region_in_parallel_(region_in_parallel)', untrue.");
        return region_in_parallel.states[0];
    }

    public static Get_final_flow_object_as_state(region_in_parallel: Region_in_parallel, force = false): SCION.State | undefined {
        if (BPMiNer.Trace) console.assert(BPMiNer.Is_region_in_parallel_(region_in_parallel), "'Get_final_flow_object_as_state' >> 'BPMiNer.Is_region_in_parallel_(region_in_parallel)', untrue.");
        let i = region_in_parallel.states.length - 1;
        for (; i >= 0; i--) {
            if (force || BPMiNer.Is_activity_wrapping_(region_in_parallel.states[i]))
                return region_in_parallel.states[i];
            if (!BPMiNer.Is_non_visual_state_id_(region_in_parallel.states[i].id))
                return region_in_parallel.states[i];
        }
        // return undefined; // Implicit...
    }

    public static Get_original_id(id: string): string {
        return id.replace(BPMiNer._BPMiNer_RegExp, "");
    }

    public static Get_original_name(name: string): string {
        const index = name.indexOf(BPMiNer.BPMiNer_Separator);
        return index === -1 ? name : name.substring(0, index);
    }

    public static Get_name_when_possible(me: ModdleElement): string {
        // 'name' must not be equal to empty string:
        return me.hasOwnProperty('name') && me.name ? BPMiNer.Get_original_name(me.name) : BPMiNer.Get_original_id(me.id);
    }

    public static Get_reentering(sequence_flow: Sequence_flow): [number, number] {
        let result: [number, number] = [0, 0];
        const source_reentered = sequence_flow.sourceRef!.id.match(BPMiNer._BPMiNer_RegExp__);
        if (source_reentered !== null)
            result[0] = source_reentered.length;
        const target_reentered = sequence_flow.targetRef!.id.match(BPMiNer._BPMiNer_RegExp__);
        if (target_reentered !== null)
            result[1] = target_reentered.length;
        if (BPMiNer.Trace) console.assert(result[0] === result[1] || result[0] === result[1] + 1, "'Get_reentering' >> 'result[0] === result[1] || result[0] === result[1] + 1', untrue.");
        return result;
    }

    public static Get_region_in_parallel(state: SCION.State): Region_in_parallel | undefined {
        if (BPMiNer.Is_activity_wrapping_(state)) {
            if (BPMiNer.Trace) console.assert(BPMiNer.Is_region_in_parallel_(state.states![0]));
            return state.states![0] as Region_in_parallel;
        } else if (BPMiNer.Is_joinable_(state)) {
            if (BPMiNer.Trace) console.assert(BPMiNer.Is_region_in_parallel_(state));
            return state as Region_in_parallel;
        }
        // return undefined; // Implicit...
    }

    public static Get_state(flow_object: Flow_object, ...states: SCION.State[]): SCION.State | undefined {
        for (const state of states) {
            const result = BPMiNer._Get_state(flow_object, state);
            if (result) return result;
        }
        // return undefined; // Implicit...
    }

    private static _Get_state(flow_object: Flow_object, state: SCION.State): SCION.State | undefined {
        if (flow_object.id === state.id || BPMiNer.Create_id_for_non_visual_state_machine_element(flow_object.id) === state.id) return state;
        if (!state.hasOwnProperty('states')) return undefined;
        let result = state.states!.find(state => state.id === flow_object.id || state.id === BPMiNer.Create_id_for_non_visual_state_machine_element(flow_object.id));
        if (result)
            return result;
        for (const state_ of state.states!) {
            result = BPMiNer._Get_state(flow_object, state_);
            if (result) break;
        }
        return result;
    }

    public static Get_superstate(...states: SCION.State[]): SCION.State {
        if (BPMiNer.Is_activity_wrapping_(states[states.length - 1]))
            return states[states.length - 1].states![0];
        return states[states.length - 1];
    }

    public static Get_SVGGElement(id?: string): SVGGElement {
        if (BPMiNer.Trace) console.assert(window.document.readyState !== 'loading');
        if (!id) {
            if (BPMiNer.Trace) console.warn("'Get_SVGGElement': " + id);
            throw new Error("'Get_SVGGElement': " + id);
        }
        /* https://developer.mozilla.org/en-US/docs/Web/API/SVGGElement */
        const result = <SVGGElement>window.document.querySelector('#LiveBPMN [data-element-id=' + id + ']'); // See "LiveBPMN" as id. in 'index.html'...
        if (!result)  // Collapsed subprocesses create problems...
            if (BPMiNer.Trace) console.warn("'Get_SVGGElement' (collapsed subprocess?): " + id + " (" + result + ")");
        return result;
    }

    public static Get_transition(source: Flow_object, target: Flow_object, state: SCION.State): SCION.Transition | undefined {
        if (BPMiNer.Is_activity_wrapping_(state)) {
            for (const transition of BPMiNer.Get_state(source, state)!.transitions!)
                if (BPMiNer.Get_original_id(transition.target) === BPMiNer.Get_original_id(target.id))
                    return transition;
        } else
            for (const transition of state.transitions!)
                if (BPMiNer.Get_original_id(transition.target) === BPMiNer.Get_original_id(target.id))
                    return transition;
        // return undefined; // Implicit...
    }

    public static Is_activity_forked_(state: SCION.State): boolean {
        /** No short-circuit evaluation within 'return': */
        return !BPMiNer._Is_forked_(state) || BPMiNer.Is_joinable_forked_(state) ? false
            : Object.values(Activity_type).includes(((state as Region_in_parallel).FORK as Activity).$type as Activity_type);
    }

    public static Is_activity_wrapping_(state: SCION.State): state is SCION.Wrapping {
        return state.hasOwnProperty('id')
            && state.id !== ""
            && state.id!.split(BPMiNer.BPMiNer_Separator).pop() === Validation.Loopback
            && state.hasOwnProperty('states')
            && state.$type === 'parallel';
    }

    public static Is_event_based_gateway_(flow_object: Readonly<Flow_object>): flow_object is Event_based_gateway {
        return flow_object.$type === Gateway_type.BPMN_EventBasedGateway;
    }

    public static Is_event_subprocess_(activity: Readonly<Activity>): boolean {
        return BPMiNer.Is_subprocess_(activity) && activity.hasOwnProperty('triggeredByEvent') && activity.triggeredByEvent === true;
    }

    private static _Is_forked_(state: SCION.State): boolean {
        return BPMiNer.FORK in state;
    }

    public static Is_gateway_(flow_object: Readonly<Flow_object>): flow_object is Gateway {
        return flow_object.$type === Gateway_type.BPMN_ComplexGateway
            || flow_object.$type === Gateway_type.BPMN_ExclusiveGateway
            || flow_object.$type === Gateway_type.BPMN_InclusiveGateway
            || flow_object.$type === Gateway_type.BPMN_ParallelGateway;
    }

    public static Is_FORK_gateway_(flow_object: Readonly<Flow_object>): flow_object is Gateway_FORK {
        return BPMiNer.Is_gateway_(flow_object)
            && flow_object.hasOwnProperty('incoming') && flow_object.incoming!.length === 1
            && flow_object.hasOwnProperty('outgoing') && flow_object.outgoing!.length > 1
    }

    public static Is_JOIN_gateway_(flow_object: Readonly<Flow_object>): flow_object is Gateway_JOIN {
        return BPMiNer.Is_gateway_(flow_object)
            && flow_object.hasOwnProperty('incoming') && flow_object.incoming!.length > 1
            && flow_object.hasOwnProperty('outgoing') && flow_object.outgoing!.length === 1;
    }

    public static Is_gateway_forked_(gateway_type: Gateway_type, state: SCION.State): boolean {
        /** No short-circuit evaluation within 'return': */
        return !BPMiNer._Is_forked_(state) || BPMiNer.Is_joinable_forked_(state) ? false : ((state as Region_in_parallel).FORK as Gateway).$type === gateway_type;
    }

    public static Is_joinable_forked_(state: SCION.State): boolean {
        /** No short-circuit evaluation within 'return': */
        return !BPMiNer._Is_forked_(state) ? false : (state as Region_in_parallel).FORK === 'JOINABLE';
    }

    public static Is_joinable_(state: SCION.State): boolean { // Event-based gateways are not subject to join stuff...
        return BPMiNer.Is_activity_forked_(state)
            || BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ComplexGateway, state)
            || BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ExclusiveGateway, state)
            || BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_InclusiveGateway, state)
            || BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ParallelGateway, state)
            || BPMiNer.Is_joinable_forked_(state);
    }

    public static Is_killed(sequence_flow: Sequence_flow): boolean {
        if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow);
        return BPMiNer.Get_SVGGElement(sequence_flow.id).classList.contains("FLOW_KILLED");
    }

    public static Is_interruptible_boundary_event_(event: Event): boolean {
        const type = BPMiNer.Compute_event_type(event);
        if (type === Event_type.BPMN_BoundaryCancelEvent || type === Event_type.BPMN_BoundaryErrorEvent)
            return true;
        if (type === Event_type.BPMN_BoundaryCompensateEvent)
            return false;
        // 'cancelActivity' is used for boundary events while 'isInterrupting' is used for start events in event subprocesses:
        return !('cancelActivity' in event) || ('cancelActivity' in event && event.cancelActivity!);
    }

    public static Is_interruptible_start_event_(event: Event): boolean {
        const type = BPMiNer.Compute_event_type(event);
        if (type === Event_type.BPMN_StartErrorEvent)
            return true;
        if (type === Event_type.BPMN_StartCompensateEvent)
            return false;
        // 'cancelActivity' is used for boundary events while 'isInterrupting' is used for start events in event subprocesses:
        return !('isInterrupting' in event) || ('isInterrupting' in event && event.isInterrupting!);
    }

    public static Is_interruptible_event_subprocess_(process: Process): boolean {
        const result = process.flowElements.filter((flow_element: ModdleElement) => flow_element.$type === Event_type.BPMN_StartEvent)
            .reduce((result, event) => {
                return result && BPMiNer.Is_interruptible_start_event_(event);
            }, true);
        return BPMiNer.Is_event_subprocess_(process) && result;
    }

    private static _Is_loopback_(from: ModdleElement, to: ModdleElement): boolean {
        return BPMiNer.Compute_transitive_closure(from).has(to);
    }

    public static Is_non_visual_state_id_(id?: string): boolean {
        if (!id) {
            if (BPMiNer.Trace) console.warn("'_Is_non_visual_state_id_': " + id); // Activities with boundary events have specific state structures...
            return true;
        }
        return id!.includes(BPMiNer.Generated_state) || id!.indexOf(BPMiNer.BPMiNer_Separator) !== -1;
    }

    public static Is_reentered_(flow_object: Readonly<ModdleElement>): boolean {
        return flow_object.id.match(BPMiNer._BPMiNer_RegExp) !== null ? true : false;
    }

    public static Is_region_in_parallel_(state: Readonly<SCION.State>): state is Region_in_parallel {
        return BPMiNer._Is_forked_(state) && 'states' in state;
    }

    public static Is_start_activity_(me: Readonly<ModdleElement>): boolean {
        return Object.values(Activity_type).includes(me.$type as Activity_type)
            && !BPMiNer.Is_event_subprocess_(me)
            && ((!me.hasOwnProperty('incoming') || me.incoming!.length === 0) || BPMiNer._Is_loopback_(me, me));
    }

    public static Is_subprocess_(activity: Readonly<Activity>): boolean {
        return activity.$type === Activity_type.BPMN_SubProcess || activity.$type === Activity_type.BPMN_Transaction;
    }

    public static Is_triggerable_(sequence_flow: Sequence_flow): boolean {
        if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow);
        return BPMiNer.Get_SVGGElement(sequence_flow.id).classList.contains("FLOW_TRIGGERABLE");
    }

    public static Is_triggered(flow: Message_flow | Sequence_flow): boolean {
        if (BPMiNer.Trace) console.assert(flow.$type === Flow_type.BPMN_MessageFlow || flow.$type === Flow_type.BPMN_SequenceFlow);
        return BPMiNer.Get_SVGGElement(flow.id).classList.contains("FLOW_TRIGGERED");
    }

    /**
     * Test if a outgoing seq. flow is inhibited (i.e., "FLOW_KILLED" as CSS style) so that it cannot trigger
     * a run-to-completion cycle when clicking on it.
     *
     * @param sequence_flow - bpmn-io.js seq. flow as 'ModdleElement' object
     * @returns 'true' if "FLOW_KILLED", 'false' otherwise
     */

    public static Kill(sequence_flow: Sequence_flow): void {
        if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow);
        if (BPMiNer.Trace) console.assert(!BPMiNer.Is_triggered(sequence_flow));
        BPMiNer.Reset(sequence_flow);
        BPMiNer.Get_SVGGElement(sequence_flow.id).classList.add("FLOW_KILLED");
    }

    public static Mark(id: string, css_class: string): void {
        // Remove all possible CSS classes:
        BPMiNer.Get_SVGGElement(id).classList.remove('Active');
        BPMiNer.Get_SVGGElement(id).classList.remove('Active_COLLAPSED');
        BPMiNer.Get_SVGGElement(id).classList.remove('Active_1');
        BPMiNer.Get_SVGGElement(id).classList.remove('Active_1_COLLAPSED');
        // Add:
        BPMiNer.Get_SVGGElement(id).classList.add(css_class);
    }

    public static Pre_trigger(sequence_flow: Sequence_flow): void {
        if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow);
        if (!BPMiNer.Is_killed(sequence_flow))
            BPMiNer.Get_SVGGElement(sequence_flow.id).classList.add("FLOW_TRIGGERABLE");
    }

    public static Pseudo_reenter(sequence_flow: Sequence_flow): string {
        const result: [number, number] = BPMiNer.Get_reentering(sequence_flow);
        if (result[0] === result[1] + 1)
            return sequence_flow.targetRef!.id + BPMiNer._BPMiNer;
        if (BPMiNer.Trace) console.assert(result[0] === result[1], "'Get_reentering' >> 'result[0] === result[1]', untrue.");
        return sequence_flow.targetRef!.id;
    }

    public static Reenter(flow_object: ModdleElement): void {
        flow_object.id += BPMiNer._BPMiNer;
    }

    public static Reenter_JOIN(sequence_flow: Sequence_flow): void {
        const result: [number, number] = BPMiNer.Get_reentering(sequence_flow);
        if (result[0] === result[1] + 1)
            BPMiNer.Reenter(sequence_flow.targetRef!);
    }

    public static Reset(flow: Message_flow | Sequence_flow): void {
        if (BPMiNer.Trace) console.assert(flow.$type === Flow_type.BPMN_MessageFlow || flow.$type === Flow_type.BPMN_SequenceFlow);
        BPMiNer.Get_SVGGElement(flow.id).classList.remove("FLOW_KILLED");
        BPMiNer.Get_SVGGElement(flow.id).classList.remove("FLOW_TRIGGERABLE");
        BPMiNer.Get_SVGGElement(flow.id).classList.remove("FLOW_TRIGGERED");
    }

    public static Suffix(name: string, execution_path: string, sequence_flow: Sequence_flow): string {
        return name + BPMiNer.BPMiNer_Separator + execution_path + sequence_flow.id;
    }

    public static Terminate_process(process: Process, event_subprocess?: Process) {
        window.dispatchEvent(new CustomEvent(BPMiNer.Create_id_for_non_visual_state_machine_element(process.id), {detail: {event_subprocess: event_subprocess}}));
    }

    public static Trigger(sequence_flow: Sequence_flow): void {
        if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow);
        if (!BPMiNer.Is_killed(sequence_flow)) {
            BPMiNer.Reset(sequence_flow);
            BPMiNer.Get_SVGGElement(sequence_flow.id).classList.add("FLOW_TRIGGERED");
        }
    }

    public static Trigger_association(association: DataInputAssociation | DataOutputAssociation): void {
        BPMiNer.Get_SVGGElement(association.id).classList.add("FLOW_TRIGGERABLE");
        if (association.sourceRef?.id)
            BPMiNer.Get_SVGGElement(association.sourceRef!.id)?.classList.add("Active_data_object");
        else if (association.hasOwnProperty('sourceRef') && Array.isArray(association.sourceRef))
            association.sourceRef.forEach((source: DataObjectReference) => BPMiNer.Get_SVGGElement(source.id)?.classList.add("Active_data_object"));
        if (association.targetRef?.id)
            BPMiNer.Get_SVGGElement(association.targetRef!.id)?.classList.add("Active_data_object");
        else if (association.hasOwnProperty('targetRef') && Array.isArray(association.targetRef))
            association.targetRef.forEach((target: DataObjectReference) => BPMiNer.Get_SVGGElement(target.id)?.classList.add("Active_data_object"));
    }

    public static Trigger_force(flow: Message_flow | Sequence_flow): void {
        if (BPMiNer.Trace) console.assert(flow.$type === Flow_type.BPMN_MessageFlow || flow.$type === Flow_type.BPMN_SequenceFlow);
        BPMiNer.Reset(flow);
        BPMiNer.Get_SVGGElement(flow.id).classList.add("FLOW_TRIGGERED");
    }

    public static Get_compensations(event: Boundary_event): Array<Association> {
        const process = event.$parent;
        if (BPMiNer.Trace) console.assert(process.$type === Diagram_type.BPMN_Process || BPMiNer.Is_subprocess_(process), "'Get_compensations' >> 'process.$type === Diagram_type.BPMN_Process || BPMiNer.Is_subprocess_(process)', untrue.");
        if (process.hasOwnProperty('artifacts'))
            return process.artifacts!.filter(association => association.$type === Data_type.BPMN_Association
                && association.associationDirection === "One"
                && association.sourceRef === event);
        return new Array;
    }

    public static Kill_compensation(association: Association): void {
        if (BPMiNer.Trace) console.assert(association.$type === Data_type.BPMN_Association && association.targetRef!.hasOwnProperty('isForCompensation') && (association.targetRef as Activity).isForCompensation === true);
        BPMiNer.Get_SVGGElement(association.id).classList.remove("FLOW_TRIGGERABLE");
        BPMiNer.Get_SVGGElement(association.targetRef!.id).classList.remove("Active");
    }

    public static Trigger_compensation(association: Association): void {
        if (BPMiNer.Trace) console.assert(association.$type === Data_type.BPMN_Association && association.targetRef!.hasOwnProperty('isForCompensation') && (association.targetRef as Activity).isForCompensation === true);
        BPMiNer.Get_SVGGElement(association.id).classList.add("FLOW_TRIGGERABLE");
        BPMiNer.Get_SVGGElement(association.targetRef!.id).classList.add("Active");
    }

    public static Untrigger_compensation(association: Association): void {
        if (BPMiNer.Trace) console.assert(association.$type === Data_type.BPMN_Association && association.targetRef!.hasOwnProperty('isForCompensation') && (association.targetRef as Activity).isForCompensation === true);
        if (BPMiNer.Get_SVGGElement(association.id).classList.contains("FLOW_TRIGGERABLE")) {
            BPMiNer.Get_SVGGElement(association.targetRef!.id).classList.remove("Active");
            BPMiNer.Get_SVGGElement(association.targetRef!.id).classList.add("Active_1");
        }
    }
}

BPMiNer.File_reader.onerror = (error: ProgressEvent<FileReader>) => {
    throw new Error("Error loading BPMN file: " + error);
};

// Get BPMN files from drag & drop or local file system:
BPMiNer.File_reader.onload = (progress_event: ProgressEvent<FileReader>) => {
    if (BPMiNer.Trace) console.assert(progress_event.target === BPMiNer.File_reader, "'BPMiNer.File_reader.onload' >> 'progress_event.target === BPMiNer.File_reader', untrue.");
    if (BPMiNer.Trace) console.assert(window.history.state !== null);
    BPMiNer.Set_current_test_case({
        index: window.history.state.index,
        name: window.history.state.name,
        XML: BPMiNer.File_reader.result as string
    });
    window.document.body.dispatchEvent(new Event(BPMiNer.Reload));
};

// 'enum' types cannot be inserted in classes in TypeScript...
class BPMiNer_process implements SCION.State_machine {
    // Try to establish if subprocess is collapsed:
    private _collapsed: boolean = false;
    public get collapsed(): boolean {
        return this._collapsed;
    }

    // Embedded (including 'transaction') subprocesses:
    private readonly _embedded_subprocesses: Map<string, BPMiNer_process> = new Map;
    private readonly _event_subprocesses: Map<string, BPMiNer_process> = new Map;

    public constructor(private readonly _process: Process, private readonly _message_flows: Array<Message_flow>) {
        if (BPMiNer.Trace) console.assert(this._process.$type === Diagram_type.BPMN_Process || BPMiNer.Is_subprocess_(this._process), "'BPMiNer_process.constructor' >> 'this._process.$type === Diagram_type.BPMN_Process || BPMiNer.Is_subprocess_(this._process)', untrue.");
        if (!this._process.hasOwnProperty('flowElements')) {
            if (BPMiNer.Trace) console.warn(BPMiNer.Get_name_when_possible(this._process) + " (empty subprocess?): '!this._process.hasOwnProperty('flowElements')'");
            this._collapsed = true;
        } else {
            // CSS style class ('./css/BPMiNer.css') to start events:
            this._get_ids(Event_type.BPMN_StartEvent).forEach((start_event_id: string) => {
                // Nothing for the moment...
            });
            this._get_ids(Flow_type.BPMN_SequenceFlow).forEach((sequence_flow_id: string) => {
                const sequence_flow_as_SVG: SVGGElement = BPMiNer.Get_SVGGElement(sequence_flow_id);
                if (sequence_flow_as_SVG) // Collapsed subprocesses create problems...
                    sequence_flow_as_SVG.classList.add('FLOW');
                else
                    this._collapsed ||= true;
            });
            try {
                if (!this._collapsed) {
                    this._executor = new scion.Statechart(this._compute_state_machine());
                    if (this._process.$type === Diagram_type.BPMN_Process)
                        this.start();
                }
            } catch (error: unknown) {
                if (error instanceof BPMN_error)
                    BPMiNer.Warn(error.location, error.message);
                else throw error; // Deal with 'error' in calling context...
            }
        }
    }

    /**
     * scion.js
     */
    private _executor!: SCION.State_machine;
    private _branches: Array<SCION.State_machine> = new Array;

    public gen(event_label: string, data?: string): void {
        this._executor.gen(event_label, data);
        // 'TEST_CASE_1b.bpmn': 'branch' is going to move from 'Event@Event' to 'Event'
        // 'setTimeout' makes 'true' outgoing guard from 'FORK COMP.' gateway based on 'Event@Event', which is still active...
        this._branches.forEach(branch => setTimeout(() => branch.gen(event_label, data)));
    }

    public getConfiguration(): Array<string> {
        return this._branches.reduce((result: Array<string>, branch: SCION.State_machine) => result.concat(branch.getConfiguration()), this._executor.getConfiguration());
    }

    public getFullConfiguration(): Array<string> {
        return this._branches.reduce((result: Array<string>, branch: SCION.State_machine) => result.concat(branch.getFullConfiguration()), this._executor.getFullConfiguration());
    }

    public isIn(state_label: string): boolean {
        return this._executor.isIn(state_label) ? true
            : this._branches.length === 0 ? false
                : this._branches.reduce((result: boolean, branch: SCION.State_machine) => result || branch.isIn(state_label), false);
    }

    private _is_terminated_(): boolean {
        return this.isIn(BPMiNer.Create_id_for_non_visual_state_machine_element(this._process.id));
    }

    /** Default behavior for seq. flows... */
    private _onTransition(sequence_flow: Sequence_flow, event?: Event): void {
        /**
         * Outgoing seq. flows are "reset", i.e., all CSS classes are removed when entering a flow object...
         * So, no need: // BPMiNer.Reset(sequence_flow);
         */
        BPMiNer.Trigger_force(sequence_flow);
        sequence_flow.targetRef!.dataInputAssociations?.forEach((association: DataInputAssociation) => BPMiNer.Trigger_association(association));
        sequence_flow.sourceRef!.dataOutputAssociations?.forEach((association: DataOutputAssociation) => BPMiNer.Trigger_association(association));
    }

    public start(): void {
        if (this._executor) {
            this._executor.start();
            this._event_subprocesses.forEach(event_subprocess => event_subprocess.start());
        }
    }

    /**
     * End of scion.js
     */

    /**
     * Get the BPMN ids of a process' elements
     *
     * @remarks
     * N/A
     *
     * @param type - The type of BPMN elements whose id. are extracted
     * @returns An array of id.
     */
    private _get_ids(type: string): Array<string> {
        if (BPMiNer.Trace) console.assert(this._process.hasOwnProperty('flowElements'), "'_get_ids' >> 'this._process.hasOwnProperty('flowElements')', untrue.");
        return this._process.flowElements.filter(me => me.$type === type).map((me: ModdleElement) => me.id);
    }

    private _get_model_element(id?: string): ModdleElement | never {
        if (!id)
            throw new Error("'_get_model_element': " + id);
        if (BPMiNer.Trace) console.assert(this._process.hasOwnProperty('flowElements'), "'_get_model_element' >> 'this._process.hasOwnProperty('flowElements')', untrue.");
        const result = this._process.flowElements.find(me => BPMiNer.Get_original_id(me.id) === BPMiNer.Get_original_id(id));
        if (!result)
            throw new Error("'_get_model_element': " + id + ": " + result);
        return result;
    }

    /**
     *
     * @param flow_object
     * @param type
     * @param superstate
     */
    private _compute_flow_object_as_state(flow_object: ModdleElement, status: Event_status | Gateway_status, superstate: SCION.State): never | SCION.State {
        const tooltip = BPMiNer.Set_tooltip(flow_object, status.type!);
        tooltip.disable();
        const flow_object_as_state: SCION.State = {
            onEntry: () => {
                BPMiNer.Mark(BPMiNer.Get_original_id(flow_object.id), 'Active');
                flow_object.dataInputAssociations?.forEach((association: DataInputAssociation) => BPMiNer.Trigger_association(association));
                flow_object.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Reset(sequence_flow));
                tooltip.enable();
                if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Get_name_when_possible(flow_object));
            },
            onExit: () => {
                BPMiNer.Mark(BPMiNer.Get_original_id(flow_object.id), 'Active_1');
                flow_object.dataOutputAssociations?.forEach((association: DataOutputAssociation) => BPMiNer.Trigger_association(association));
                flow_object.outgoing?.forEach((sequence_flow: Sequence_flow) => {
                    if (!BPMiNer.Is_triggered(sequence_flow))
                        BPMiNer.Kill(sequence_flow);
                });
                tooltip.disable();
                if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Get_name_when_possible(flow_object));
            },
            id: flow_object.id
        };
        const type = flow_object.$type === Gateway_type.BPMN_ComplexGateway
        || flow_object.$type === Gateway_type.BPMN_EventBasedGateway
        || flow_object.$type === Gateway_type.BPMN_ExclusiveGateway
        || flow_object.$type === Gateway_type.BPMN_InclusiveGateway
        || flow_object.$type === Gateway_type.BPMN_ParallelGateway
            ? status.type :
            status.basic_type;
        switch (type) {
            case Event_type.BPMN_BoundaryEvent:
            case Event_type.BPMN_EndEvent:
            case Event_type.BPMN_IntermediateCatchEvent:
            case Event_type.BPMN_IntermediateThrowEvent:
            case Event_type.BPMN_StartEvent:
                flow_object_as_state.transitions = new Array;
                break;
            case Gateway_type.BPMN_EventBasedGatewayExclusive:
            case Gateway_type.BPMN_EventBasedGatewayParallel:
                flow_object_as_state.states = new Array;
                flow_object_as_state.$type = BPMiNer.Parallel;
                break;
            case Gateway_type.BPMN_ComplexGatewayFORK:
            case Gateway_type.BPMN_ExclusiveGatewayFORK:
            case Gateway_type.BPMN_InclusiveGatewayFORK:
            case Gateway_type.BPMN_ParallelGatewayFORK:
                flow_object_as_state.states = new Array;
                flow_object_as_state.transitions = new Array; // For loopbacks...
                flow_object_as_state.$type = BPMiNer.Parallel;
                break;
            case Gateway_type.BPMN_ComplexGatewayJOIN:
            case Gateway_type.BPMN_ExclusiveGatewayJOIN:
            case Gateway_type.BPMN_InclusiveGatewayJOIN:
            case Gateway_type.BPMN_ParallelGatewayJOIN:
                flow_object_as_state.transitions = new Array;
                break;
            default:
                throw new BPMN_error(flow_object, BPMN_error.BPMN_element_type_is_not_supported, status.basic_type);
        }
        superstate.states!.push(flow_object_as_state);
        return flow_object_as_state;
    }

    private _extend_region_in_parallel(execution_flow: Sequence_flow, region_in_parallel: Region_in_parallel): void {
        /**
         * This method adds a non-visual state at the beginning of the region-in-parallel's execution flow, e.g.,
         * 'Event@Event' in 'TEST_CASE_1b.bpmn' ('Event@Event -e-> Event' transition is created accordingly)...
         */
        const initial_flow_object_as_state: SCION.State = BPMiNer.Get_initial_flow_object_as_state(region_in_parallel);
        const initial_flow_object_as_state_id: string = BPMiNer.Is_activity_wrapping_(initial_flow_object_as_state)
            ? BPMiNer.Get_state(execution_flow.targetRef!, initial_flow_object_as_state)!.id!
            : initial_flow_object_as_state.id!;
        if (BPMiNer.Is_non_visual_state_id_(initial_flow_object_as_state_id))
            return; // Beginning of the region-in-parallel's execution flow is already set by JOIN procedure...
        // 'B@B' in 'TEST_CASE_3a.bpmn':
        let non_visual_state_id = BPMiNer.Create_id_for_non_visual_state_machine_element(initial_flow_object_as_state_id);
        // 'BCMS_Req._2.bpmn', 'TeletravailDEADLOCK.bpmn': 'join_parallel_gateway' has already created non-visual state, e.g.,
        // 'Agrees F.@Agrees F.' in 'BCMS_Req._2.bpmn':
        if (region_in_parallel.states.find(state => state.id === non_visual_state_id))
            non_visual_state_id = BPMiNer.Create_id_for_non_visual_state_machine_element(non_visual_state_id);
        region_in_parallel.states.unshift({
            id: non_visual_state_id,
            onEntry: () => {
                if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(initial_flow_object_as_state_id))));
            },
            onExit: () => {
                if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(initial_flow_object_as_state_id))));
            },
            transitions: new Array()
        });
        (region_in_parallel.FORK as Gateway).outgoing?.filter(sequence_flow => sequence_flow.targetRef!.id === initial_flow_object_as_state_id)
            .forEach(sequence_flow =>
                // 'TEST_CASE_3a.bpmn', 'B@B -c-> B@Loopback' is required because 'B@B' just became first (default) state...
                // 'TEST_CASE_1.bpmn', 'END1@END1 -e-> END1'
                BPMiNer.Get_initial_flow_object_as_state(region_in_parallel).transitions!.push({
                    event: sequence_flow.id,
                    onTransition: this._onTransition.bind(this, sequence_flow),
                    target: initial_flow_object_as_state.id!
                }));
    }

    private _create_branch(execution_flow: Sequence_flow, region_in_parallel: Region_in_parallel): void {
        /**
         * 'TEST_CASE_1a.bpmn', 'TEST_CASE_1b.bpmn', 'TEST_CASE_2.bpmn', 'TEST_CASE_2a.bpmn', 'Event_based_gateway_.bpmn',
         * 'TEST_CASE_3.bpmn', 'TEST_CASE_3a.bpmn',
         * 'Sick.bpmn', 'Breakfast__.bpmn', 'Breakfast_.bpmn', 'Breakfast.bpmn', 'Parallel_gateway_no_JOIN.bpmn',
         * 'NYC_MOMA_drop_off_.bpmn' ("Store belongings"), 'NYC_MOMA_drop_off.bpmn' ("Store belongings")
         * 'Process_ending'
         */
        if (execution_flow.sourceRef !== region_in_parallel.FORK) // 'TEST_CASE_3.bpmn', select 'FORK PAR.1 -> A' and 'FORK PAR.2 -> B'...
            return;
        if (execution_flow.targetRef?.$type === Event_type.BPMN_EndEvent)
            return;
        // Retain execution path without join (open question: test the fact that join, if it exists, has the same gateway type that 'region_in_parallel.FORK'?):
        if ([...BPMiNer.Compute_transitive_closure(execution_flow.targetRef!).add(execution_flow.targetRef!)].some((flow_object: Flow_object) => BPMiNer.Is_JOIN_gateway_(flow_object)))
            return;
        const terminate_context: string = BPMiNer.Create_id_for_non_visual_state_machine_element(this._process.id);
        const branch = new scion.Statechart({
            states: [...region_in_parallel.states, {id: terminate_context}],
            transitions: new Array({event: terminate_context, target: terminate_context})
        });
        this._branches.push(branch);
        while (region_in_parallel.states.length > 0)
            region_in_parallel.states.pop();
        region_in_parallel.onEntry = () => branch.start();
    }

    private _no_join(execution_flow: Sequence_flow, state: SCION.State): void {
        /*
        * Execution closure amounts to "adjusting" -complex, exclusive, inclusive, and parallel- FORK gateways without JOIN gateways as counterparts...
        */
        const region_in_parallel: Region_in_parallel = state as Region_in_parallel;
        if (!BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ComplexGateway, region_in_parallel)
            && !BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ExclusiveGateway, region_in_parallel)
            && !BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_InclusiveGateway, region_in_parallel)
            && !BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ParallelGateway, region_in_parallel))
            return;
        if (BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ParallelGateway, region_in_parallel)) {
            this._create_branch(execution_flow, region_in_parallel);
            return;
        }
        this._extend_region_in_parallel(execution_flow, region_in_parallel);
        if (BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ComplexGateway, region_in_parallel) || BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_InclusiveGateway, region_in_parallel))
            this._create_branch(execution_flow, region_in_parallel);
    }

    /**
     * Activities
     */
    private static _Validate_activity = (activity: ModdleElement): Activity_status => {
        if (!Object.values(Activity_type).includes(activity.$type as Activity_type)) // 'values' => ES2017!
            return {basic_type: <Activity_type>activity.$type, validation: new Set([Validation.Activity_Unknown])};
        switch (activity.$type as Activity_type) {
            case Activity_type.BPMN_BusinessRuleTask:
            case Activity_type.BPMN_CallActivity:
            case Activity_type.BPMN_ManualTask:
            case Activity_type.BPMN_ReceiveTask:
            case Activity_type.BPMN_ScriptTask:
            case Activity_type.BPMN_SendTask:
            case Activity_type.BPMN_ServiceTask:
            case Activity_type.BPMN_SubProcess:
            case Activity_type.BPMN_Task:
            case Activity_type.BPMN_Transaction:
            case Activity_type.BPMN_UserTask:
                if (activity.hasOwnProperty('incoming') && activity.incoming!.length === 0)
                    return {
                        basic_type: <Activity_type>activity.$type,
                        type: BPMiNer.Compute_activity_type(activity),
                        validation: new Set([Validation.Activity_as_start_point])
                    };
                if (activity.hasOwnProperty('incoming') && activity.incoming!.length > 1)
                    return {
                        basic_type: <Activity_type>activity.$type,
                        type: BPMiNer.Compute_activity_type(activity),
                        validation: new Set([Validation.Activity_suspicious_JOIN_parallelism])
                    };
                if (activity.hasOwnProperty('outgoing') && activity.outgoing!.length === 0)
                    return {
                        basic_type: <Activity_type>activity.$type,
                        type: BPMiNer.Compute_activity_type(activity),
                        validation: new Set([Validation.Activity_as_end_point])
                    };
                if (activity.hasOwnProperty('outgoing') && activity.outgoing!.length > 1 && !activity['default'])
                    return {
                        basic_type: <Activity_type>activity.$type,
                        type: BPMiNer.Compute_activity_type(activity),
                        validation: new Set([Validation.Activity_implicit_FORK_parallelism])
                    };
                return {
                    basic_type: <Activity_type>activity.$type,
                    type: BPMiNer.Compute_activity_type(activity),
                    validation: new Set
                };
                break;
            default:
                return {basic_type: <Activity_type>activity.$type, validation: new Set([Validation.Activity_Unknown])};
        }
    }

    private _get_BPMiNer_process(activity: Activity): BPMiNer_process {
        return this._embedded_subprocesses.get(BPMiNer.Get_original_id(activity.id))!;
    }

    private _is_collapsed_(activity: Activity): boolean {
        return this._get_BPMiNer_process(activity).collapsed;
    }

    private _is_message_flow_source(flow_object: Activity | Event, status: Activity_status | Event_status): boolean {
        return (status.type === Event_type.BPMN_EndMessageEvent
                || status.type === Event_type.BPMN_IntermediateThrowMessageEvent
                || status.type === Activity_type.BPMN_SendTask)
            && this._message_flows.filter(message_flow => message_flow.sourceRef === flow_object).length !== 0;
    }

    private _is_message_flow_target(flow_object: Activity | Event, status: Activity_status | Event_status): boolean {
        return (status.type === Event_type.BPMN_StartMessageEvent
                || status.type === Event_type.BPMN_IntermediateCatchMessageEvent
                || status.type === Activity_type.BPMN_ReceiveTask)
            && this._message_flows.filter(message_flow => message_flow.targetRef === flow_object).length !== 0;
    }

    private _compute_activity_as_state(activity: Activity, activity_id: string, status: Activity_status, boundary_events: Array<Boundary_event>, superstate: SCION.State): SCION.State {
        const tooltip = BPMiNer.Set_tooltip(activity, status.type!);
        tooltip.disable();
        const activity_as_state: SCION.State = {
            onEntry: () => {
                if (BPMiNer.Is_subprocess_(activity) && !this._is_collapsed_(activity)) {
                    BPMiNer.Mark(BPMiNer.Get_original_id(activity.id), 'Active_COLLAPSED');
                    this._get_BPMiNer_process(activity).start();
                } else
                    BPMiNer.Mark(BPMiNer.Get_original_id(activity.id), 'Active');
                activity.dataInputAssociations?.forEach((association: DataInputAssociation) => BPMiNer.Trigger_association(association));
                activity.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Reset(sequence_flow));
                tooltip.enable();
                if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Get_name_when_possible(activity));
            },
            onExit: () => {
                if (BPMiNer.Is_subprocess_(activity) && !this._is_collapsed_(activity))
                    BPMiNer.Mark(BPMiNer.Get_original_id(activity.id), 'Active_1_COLLAPSED');
                else
                    BPMiNer.Mark(BPMiNer.Get_original_id(activity.id), 'Active_1');
                activity.dataOutputAssociations?.forEach((association: DataOutputAssociation) => BPMiNer.Trigger_association(association));
                activity.outgoing?.forEach((sequence_flow: Sequence_flow) => {
                    if (!BPMiNer.Is_triggered(sequence_flow))
                        BPMiNer.Kill(sequence_flow);
                });
                tooltip.disable();
                if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Get_name_when_possible(activity));
            },
            id: activity.id,
            transitions: new Array
        };
        /**
         * Ver. 1.0.2: test cases 'A.4.0.bpmn' 'C.1.0.bpmn' have abstract tasks that send and receive messages
         */
        const outgoing_message_flows = this._message_flows.filter(message_flow => message_flow.sourceRef === activity);
        if (status.basic_type === Activity_type.BPMN_ReceiveTask) {
            const message_flows = this._message_flows.filter(message_flow => message_flow.targetRef === activity);
            if (message_flows.length === 0) {
                BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(activity, status) + activity.$parent.id,
                    () => {
                        if (this.isIn(activity_id))
                            activity.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                    });
                BPMiNer.Set_tooltip(activity, "Receive_No_Message_Flows");
            } else {
                BPMiNer.Record_listener(BPMiNer.Get_original_id(activity.id),
                    () => {
                        if (this.isIn(activity_id))
                            activity.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                    });
                BPMiNer.Set_tooltip(activity, "Receive_Message_Flows");
            }
        }
        if (status.basic_type === Activity_type.BPMN_SendTask || /* 'A.4.0.bpmn': */ outgoing_message_flows.length > 0) {
            outgoing_message_flows.forEach(outgoing_message_flow =>
                BPMiNer.Record_listener(outgoing_message_flow.id,
                    () => {
                        if (this.isIn(activity_id)) {
                            BPMiNer.Trigger_force(outgoing_message_flow);
                            window.dispatchEvent(new Event(BPMiNer.Get_original_id(outgoing_message_flow.targetRef!.id)));
                            // Test case 'C.1.0.bpmn', abstract tasks that send messages *AREN'T* complete after sending:
                            if (status.basic_type === Activity_type.BPMN_SendTask)
                                activity.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                        }
                    }));
            if (outgoing_message_flows.length === 0) {
                const onExit: () => void = activity_as_state.onExit!; // 'onExit' has been set in '_compute_activity_as_state'...
                activity_as_state.onExit = () => {
                    onExit();
                    window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(activity, status) + activity.$parent.id));
                };
                BPMiNer.Set_tooltip(activity, "Send_");
            } else {
                const onEntry: () => void = activity_as_state.onEntry!; // 'onEntry' has been set in '_compute_activity_as_state'...
                activity_as_state.onEntry = () => {
                    onEntry();
                    outgoing_message_flows.forEach(outgoing_message_flow => BPMiNer.Reset(outgoing_message_flow));
                };
                // Test case 'C.1.0.bpmn', abstract tasks that send messages *AREN'T* complete after sending:
                if (status.basic_type === Activity_type.BPMN_SendTask)
                    BPMiNer.Set_tooltip(activity, "Send");
                else BPMiNer.Set_tooltip(activity, "Send___");
            }
        }
        if (BPMiNer.Is_subprocess_(activity) && !this._is_collapsed_(activity))
            BPMiNer.Adjust_tooltip(activity, status.type!, "'dblclick'");
        if (boundary_events.length > 0) {
            // Activities with boundary events require a wrapping state:
            const wrapping: SCION.Wrapping = {
                id: BPMiNer.Create_id_for_non_visual_state_machine_element(activity_id, Validation.Loopback),
                states: new Array,
                transitions: [
                    {
                        event: Validation.Loopback,
                        target: BPMiNer.Create_id_for_non_visual_state_machine_element(activity_id, Validation.Loopback)
                    }
                ],
                $type: BPMiNer.Parallel
            };
            superstate.states!.push(wrapping);
            // 'execution_stack[0]' next contains the created region in parallel:
            const execution_stack: Array<SCION.State> = this._create_region_in_parallel(activity, wrapping);
            execution_stack[0].states!.push(activity_as_state); // Wrapping...
            if (boundary_events.filter(event => BPMiNer.Is_interruptible_boundary_event_(event)).length > 0) {
                activity_as_state.states = new Array; // States embodying *INTERRUPTIBLE* boundary events for 'activity'...
                activity_as_state.$type = BPMiNer.Parallel;
            }
            return wrapping;
        }
        superstate.states!.push(activity_as_state);
        return activity_as_state;
    }

    private _compute_activity_execution(me: ModdleElement, ...states: SCION.State[]): Activity_status | never {
        const activity = BPMiNer.Is_start_activity_(me) ? me : me.targetRef!;
        let activity_id = activity.id;
        const status: Activity_status = BPMiNer_process._Validate_activity(activity);
        if (status.validation.has(Validation.Activity_Unknown))
            throw new BPMN_error(activity, ...Array.from(status.validation));
        if (!BPMiNer.Is_start_activity_(me)) {
            BPMiNer.Compute_execution_path(me, activity, status);
            if (status.validation.has(Validation.Loopback))
                return status;
            if (status.validation.has(Validation.Reentrance))
                activity_id = activity.id;
        }
        const boundary_events: Array<Boundary_event> = BPMiNer.Get_boundary_events(activity);
        const activity_as_state: SCION.State = this._compute_activity_as_state(activity, activity_id, status, boundary_events, states[states.length - 1]);
        /**
         * One may click on an activity provided that it exists an outgoing seq. flow set to 'default'.
         */
        const default_: Sequence_flow | undefined = activity['default'];
        if (default_)
            BPMiNer.Set_tooltip(activity, "Activity_with_default");
        BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(activity.id)).addEventListener('click', (me: MouseEvent) => {
            me.stopPropagation();
            const triggered: Sequence_flow | undefined = activity.outgoing?.find((sequence_flow: Sequence_flow) => BPMiNer.Is_triggered(sequence_flow))
            const trigger: Sequence_flow | undefined = triggered !== undefined ? triggered : default_ !== undefined ? default_ : undefined;
            if (trigger !== undefined) {
                if (this.isIn(activity_id)) {
                    this.gen(trigger.id);
                    if (trigger === default_) // May be omitted...
                        BPMiNer.Trigger_force(trigger);
                    activity.outgoing?.filter((sequence_flow: Sequence_flow) => sequence_flow !== trigger)
                        .forEach((sequence_flow: Sequence_flow) => {
                            if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === activity.id);
                            BPMiNer.Kill(sequence_flow);
                        });
                }
            }
        });
        boundary_events.forEach((event: Boundary_event) => {
            if (BPMiNer.Is_interruptible_boundary_event_(event)) // 'activity_as_state' is "wrapping" state:
                this._compute_interruptible_boundary_event_execution(event, me, ...states, BPMiNer.Get_region_in_parallel(activity_as_state)!, BPMiNer.Get_state(activity, activity_as_state)!);
            else { // Each non-interruptible boundary event is created as an independent parallel execution path:
                const execution_stack: Array<SCION.State> = this._create_region_in_parallel('JOINABLE', activity_as_state as SCION.Fork, ...states);
                // Compensation events do not have an 'outgoing' field:
                let execution_paths = boundary_events.filter(boundary_event => BPMiNer_process._Compute_event_type(boundary_event) !== Event_type.BPMN_BoundaryCompensateEvent
                    && BPMiNer.Is_interruptible_boundary_event_(boundary_event))
                    .map(boundary_event => boundary_event.outgoing ? boundary_event.outgoing : new Array).flat()
                    .filter(sequence_flow => sequence_flow.sourceRef !== event);
                /** Caution: associations from compensation boundary events and thus compensation tasks, are considered as "final" */
                execution_paths = execution_paths.concat(boundary_events.filter(event_ => BPMiNer_process._Compute_event_type(event_) === Event_type.BPMN_BoundaryCompensateEvent)
                    .map(event_ => BPMiNer.Get_compensations(event_)).flat()
                    .filter(association => association.sourceRef !== event));
                if (activity.hasOwnProperty('outgoing'))
                    execution_paths = execution_paths.concat(activity.outgoing ? activity.outgoing : new Array);
                this._compute_non_interruptible_boundary_event_execution(event, me, execution_paths, ...execution_stack);
            }
        });

        let implicit_parallelism: SCION.Fork;
        if (status.validation.has(Validation.Activity_implicit_FORK_parallelism)) {
            implicit_parallelism = {
                states: new Array,
                $type: BPMiNer.Parallel
            };
            if (BPMiNer.Is_activity_wrapping_(activity_as_state))
                activity_as_state.states!.push(implicit_parallelism);
            else
                states[states.length - 1].states!.push(implicit_parallelism);
        }

        activity.outgoing?.forEach((sequence_flow: Sequence_flow) => {
            if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === activity.id);
            /**
             * Assign (specific) animation behavior for direct outgoing seq. flows.
             * Note that BPMN "default" seq. flows *DO NOT* react to 'click'.
             */
            if (default_ === undefined || (default_ !== undefined && sequence_flow.id !== default_.id)) {
                let click: 'click' | 'dblclick' = 'click';
                if (BPMiNer.Is_subprocess_(activity))
                    click = this._is_collapsed_(activity) ? 'click' : 'dblclick';
                if (this._is_message_flow_source(activity, status) || this._is_message_flow_target(activity, status))
                    click = 'dblclick';
                BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener(click, (me: MouseEvent) => {
                    /**
                     * Improvement ('./TEST_CASES/JOIN_exclusive_gateway/Reentrance.bpmn'): 2 handlers are registered
                     * since 2 execution ways exist in leaving 'Task'...
                     * Idea: register only 1 handler in testing the state of 'Task' and 'TaskBPMiNer'?
                     */
                    me.stopPropagation();
                    if (this.isIn(activity_id)) {
                        /* One simulates the fact one clicks on the activity itself: */
                        BPMiNer.Trigger(sequence_flow);
                        BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(activity.id)).dispatchEvent(new Event('click'));
                    }
                });
            }
            // Since 'activity_as_state' might be the wrapping state, one searches the "true" state representing 'activity':
            BPMiNer.Get_state(activity, activity_as_state)!.transitions!.push({
                event: sequence_flow.id,
                target: sequence_flow.targetRef!.id
            });
            if (BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_EventBasedGateway, states[states.length - 1]))
                states.pop();
            // Recursive call:
            let status_: Activity_status | Event_status | Gateway_status;
            if (BPMiNer.Is_activity_wrapping_(activity_as_state)) {
                if (status.validation.has(Validation.Activity_implicit_FORK_parallelism))
                    status_ = this._compute_state(sequence_flow, ...states, BPMiNer.Get_region_in_parallel(activity_as_state)!, ...this._create_region_in_parallel('JOINABLE', implicit_parallelism));
                else
                    status_ = this._compute_state(sequence_flow, ...states, BPMiNer.Get_region_in_parallel(activity_as_state)!)
            } else if (status.validation.has(Validation.Activity_implicit_FORK_parallelism))
                status_ = this._compute_state(sequence_flow, ...states, ...this._create_region_in_parallel('JOINABLE', implicit_parallelism));
            else
                status_ = this._compute_state(sequence_flow, ...states);

            if (status_.validation.has(Validation.Loopback))
                BPMiNer.Get_state(activity, activity_as_state)!.transitions![BPMiNer.Get_state(activity, activity_as_state)!.transitions!.length - 1].onTransition =
                    () => setTimeout(() => this._executor.gen(Validation.Loopback));
            if (status_.validation.has(Validation.Reentrance))  // Last recorded transition target must change:
                BPMiNer.Get_transition(sequence_flow.sourceRef!, sequence_flow.targetRef!, activity_as_state)!.target = sequence_flow.targetRef!.id;
        });
        if (!BPMiNer.Is_start_activity_(me))
            this._no_join(me, states[states.length - 1]);
        return status;
    }

    /**
     * End of activities
     */
    /**
     * Events
     */
    private static _Compute_event_type(event: ModdleElement): Event_type {
        if (BPMiNer.Trace) console.assert(event.$type.includes("Event"), "'_Compute_event_type' >> 'event.$type.includes(\"Event\")', untrue.");
        if ('eventDefinitions' in event) {
            // Case when 'event.eventDefinitions.length > 1'?
            if (BPMiNer.Trace) console.assert(event.eventDefinitions!.length === 1, "'_Compute_event_type' >> 'event.eventDefinitions.length === 1', untrue.");
            return <Event_type>(event.$type + BPMiNer.BPMiNer_Separator + event.eventDefinitions![0].$type);
        }
        return <Event_type>event.$type;
    }

    private static _Validate_event(event: ModdleElement): Event_status {
        if (!Object.values(Event_type).includes(event.$type as Event_type)) // 'values' => ES2017!
            return {basic_type: <Event_type>event.$type, validation: new Set([Validation.Event_Unknown])};
        if (event.$type === Event_type.BPMN_BoundaryEvent) {
            if (event.hasOwnProperty('incoming'))
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.Boundary_event_with_incoming_flow])
                };
            if (event.hasOwnProperty('outgoing') && event.outgoing!.length > 1)
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.Boundary_event_non_executable_FORK_parallelism])
                };
            return {basic_type: event.$type, type: BPMiNer_process._Compute_event_type(event), validation: new Set};
        }
        if (event.$type === Event_type.BPMN_EndEvent) {
            if (event.hasOwnProperty('outgoing'))
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.End_event_with_outgoing_flow])
                };
            if (event.hasOwnProperty('incoming') && event.incoming!.length > 1)
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.End_event_suspicious_JOIN_parallelism])
                };
            return {basic_type: event.$type, type: BPMiNer_process._Compute_event_type(event), validation: new Set};
        }
        if (event.$type === Event_type.BPMN_IntermediateCatchEvent || event.$type === Event_type.BPMN_IntermediateThrowEvent) {
            if (event.hasOwnProperty('incoming') && event.incoming!.length > 1)
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.Intermediate_event_suspicious_JOIN_parallelism])
                };
            if (event.hasOwnProperty('outgoing') && event.outgoing!.length > 1)
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.Intermediate_event_non_executable_FORK_parallelism])
                };
            return {basic_type: event.$type, type: BPMiNer_process._Compute_event_type(event), validation: new Set};
        }
        if (event.$type === Event_type.BPMN_StartEvent) {
            if (event.hasOwnProperty('incoming'))
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.Start_event_with_incoming_flow])
                };
            if (event.hasOwnProperty('outgoing') && event.outgoing!.length > 1)
                return {
                    basic_type: event.$type,
                    type: BPMiNer_process._Compute_event_type(event),
                    validation: new Set([Validation.Start_event_non_executable_FORK_parallelism])
                };
            return {basic_type: event.$type, type: BPMiNer_process._Compute_event_type(event), validation: new Set};
        }
        return {basic_type: <Event_type>event.$type, validation: new Set([Validation.Event_Unknown])};
    }

    private _compute_end_event_as_state(event: Event, event_id: string, status: Event_status, superstate: SCION.State): SCION.State {
        const event_as_state: SCION.State = this._compute_flow_object_as_state(event, status, superstate);
        const onEntry: () => void = event_as_state.onEntry!; // 'onEntry' has been set in '_compute_flow_object_as_state'...
        if (status.type === Event_type.BPMN_EndCancelEvent || status.type === Event_type.BPMN_EndErrorEvent)
            event_as_state.onEntry = () => {
                onEntry();
                window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(event, status) + event.$parent.id));
                BPMiNer.Terminate_process(event.$parent);
            };
        if (status.type === Event_type.BPMN_EndCompensateEvent)
            event_as_state.onEntry = () => {
                onEntry();
                window.dispatchEvent(new CustomEvent(BPMiNer.Get_communication_pattern(event, status), {detail: {compensation: true}}));
                window.dispatchEvent(new CustomEvent(event.$parent.id, {detail: {event: event}}));
            };
        if (status.type === Event_type.BPMN_EndEscalationEvent)
            event_as_state.onEntry = () => {
                onEntry();
                window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(event, status) + event.$parent.id));
                window.dispatchEvent(new CustomEvent(event.$parent.id, {detail: {event: event}}));
            };
        /* Note: 'multiple' and 'parallel multiple' events appear as "blank" events, i.e. 'Event_type.BPMN_EndEvent', without specific execution semantics */
        if (status.type === Event_type.BPMN_EndEvent)
            event_as_state.onEntry = () => {
                onEntry();
                window.dispatchEvent(new CustomEvent(event.$parent.id, {detail: {event: event}}));
            };
        if (status.type === Event_type.BPMN_EndMessageEvent) {
            const message_flows = this._message_flows.filter(message_flow => message_flow.sourceRef === event);
            if (message_flows.length === 0)
                event_as_state.onEntry = () => {
                    onEntry();
                    window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(event, status) + event.$parent.id));
                    window.dispatchEvent(new CustomEvent(event.$parent.id, {detail: {event: event}}));
                };
            else {
                event_as_state.onEntry = () => {
                    onEntry();
                    message_flows.forEach(message_flow => BPMiNer.Reset(message_flow));
                };
                message_flows.forEach(message_flow =>
                    BPMiNer.Record_listener(message_flow.id,
                        () => {
                            if (this.isIn(event_id)) {
                                BPMiNer.Trigger_force(message_flow);
                                window.dispatchEvent(new Event(BPMiNer.Get_original_id(message_flow.targetRef!.id)));
                                if (message_flows.length === message_flows.filter(message_flow_ => BPMiNer.Is_triggered(message_flow_)).length)
                                    window.dispatchEvent(new CustomEvent(event.$parent.id, {detail: {event: event}}));
                            }
                        }));
                BPMiNer.Set_tooltip(event, "Send__");
            }
        }
        if (status.type === Event_type.BPMN_EndSignalEvent)
            event_as_state.onEntry = () => {
                onEntry();
                window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(event, status)));
                window.dispatchEvent(new CustomEvent(event.$parent.id, {detail: {event: event}}));
            };
        if (status.type === Event_type.BPMN_EndTerminateEvent)
            event_as_state.onEntry = () => {
                onEntry();
                BPMiNer.Terminate_process(event.$parent);
            };
        return event_as_state;
    }

    private _compute_end_event_execution(execution_flow: Sequence_flow, ...states: SCION.State[]): Event_status | never {
        const event = execution_flow.targetRef!;
        let event_id = event.id;
        const status: Event_status = BPMiNer_process._Validate_event(event);
        if (status.validation.has(Validation.End_event_with_outgoing_flow)
            || status.validation.has(Validation.Event_Unknown))
            throw new BPMN_error(event, ...Array.from(status.validation));
        BPMiNer.Compute_execution_path(execution_flow, execution_flow.targetRef!, status);
        if (status.validation.has(Validation.Loopback))
            throw new BPMN_error(event, ...Array.from(status.validation));
        if (status.validation.has(Validation.Reentrance))
            event_id = event.id;
        const superstate = BPMiNer.Get_superstate(...states);
        const event_as_state = this._compute_end_event_as_state(event, event_id, status, superstate);
        this._no_join(execution_flow, states[states.length - 1]);
        return status;
    }

    private _compute_intermediate_event_as_state(event: Event, event_id: string, status: Event_status, superstate: SCION.State): SCION.State {
        const event_as_state: SCION.State = this._compute_flow_object_as_state(event, status, superstate);
        /* Note: 'multiple' and 'parallel multiple' events appear as "blank" events without specific execution semantics */
        if (status.type === Event_type.BPMN_IntermediateCatchMessageEvent) {
            const message_flows = this._message_flows.filter(message_flow => message_flow.targetRef === event);
            if (message_flows.length === 0) {
                BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status) + event.$parent.id,
                    () => {
                        if (this.isIn(event_id))
                            event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('click')));
                    });
                BPMiNer.Set_tooltip(event, "Receive_No_Message_Flows");
            } else {
                BPMiNer.Record_listener(BPMiNer.Get_original_id(event.id),
                    () => {
                        if (this.isIn(event_id))
                            event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                    });
                BPMiNer.Set_tooltip(event, "Receive_Message_Flows");
            }
        }
        if (status.type === Event_type.BPMN_IntermediateCatchSignalEvent) {
            BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status),
                () => {
                    if (this.isIn(event_id))
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                });
        }
        if (status.type === Event_type.BPMN_IntermediateThrowCompensateEvent) {
            const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
            event_as_state.onExit = () => {
                onExit();
                setTimeout(() => {
                    const compensation = event.outgoing!.reduce((result: boolean, sequence_flow: Sequence_flow) => result &&= BPMiNer.Is_triggered(sequence_flow), true);
                    window.dispatchEvent(new CustomEvent(BPMiNer.Get_communication_pattern(event, status), {detail: {compensation: compensation}}));
                });
            };
        }
        if (status.type === Event_type.BPMN_IntermediateThrowEscalationEvent) {
            const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
            event_as_state.onExit = () => {
                onExit();
                window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(event, status) + event.$parent.id));
            };
        }
        if (status.type === Event_type.BPMN_IntermediateThrowMessageEvent) {
            const message_flows = this._message_flows.filter(message_flow => message_flow.sourceRef === event);
            message_flows.forEach(message_flow =>
                BPMiNer.Record_listener(message_flow.id,
                    () => {
                        if (this.isIn(event_id)) {
                            BPMiNer.Trigger_force(message_flow);
                            window.dispatchEvent(new Event(BPMiNer.Get_original_id(message_flow.targetRef!.id)));
                            event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                        }
                    })
            );
            if (message_flows.length === 0) {
                const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
                event_as_state.onExit = () => {
                    onExit();
                    window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(event, status) + event.$parent.id));
                };
                BPMiNer.Set_tooltip(event, "Send_");
            } else {
                const onEntry: () => void = event_as_state.onEntry!; // 'onEntry' has been set in '_compute_flow_object_as_state'...
                event_as_state.onEntry = () => {
                    onEntry();
                    message_flows.forEach(message_flow => BPMiNer.Reset(message_flow));
                };
                BPMiNer.Set_tooltip(event, "Send");
            }
        }
        if (status.type === Event_type.BPMN_IntermediateThrowSignalEvent) {
            const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
            event_as_state.onExit = () => {
                onExit();
                window.dispatchEvent(new Event(BPMiNer.Get_communication_pattern(event, status)));
            };
        }
        return event_as_state;
    }

    private _compute_intermediate_event_execution(execution_flow: Sequence_flow, ...states: SCION.State[]): Event_status | never {
        const event = execution_flow.targetRef!;
        let event_id = event.id;
        const status: Event_status = BPMiNer_process._Validate_event(event);
        if (status.validation.has(Validation.Intermediate_event_non_executable_FORK_parallelism)
            || status.validation.has(Validation.Event_Unknown))
            throw new BPMN_error(event, ...Array.from(status.validation));
        BPMiNer.Compute_execution_path(execution_flow, execution_flow.targetRef!, status);
        if (status.validation.has(Validation.Loopback))
            return status;
        if (status.validation.has(Validation.Reentrance))
            event_id = event.id;
        const superstate = BPMiNer.Get_superstate(states[states.length - 1]);
        const event_as_state: SCION.State = this._compute_intermediate_event_as_state(event, event_id, status, superstate);
        /** Link throw events do not have an 'outgoing' field */
        if (status.type === Event_type.BPMN_IntermediateThrowLinkEvent) {
            // Create transition(s) to link catch event(s) whose name (use "type" when absent) is the same:
            this._process.flowElements.filter(me => BPMiNer.Compute_event_type(me) === Event_type.BPMN_IntermediateCatchLinkEvent
                && BPMiNer.Get_communication_pattern(me, status) === BPMiNer.Get_communication_pattern(event, status))
                .forEach(event_ => {
                    const id = BPMiNer.Create_id_for_non_visual_state_machine_element(event.id, event_.id);
                    event_as_state.transitions!.push({
                        event: id,
                        target: event_.id
                    });
                    const onEntry: () => void = event_as_state.onEntry!; // 'onEntry' has been set in '_compute_intermediate_event_as_state'...
                    event_as_state.onEntry = () => {
                        onEntry();
                        setTimeout(() => {
                            this._executor.gen(id);
                            if (BPMiNer.Trace) console.info("\t\tonEntry ^" + id + " in " + BPMiNer.Get_name_when_possible(event));
                        });
                    };
                    const execution_flow: Sequence_flow = {
                        id: id,
                        $parent: event.$parent,
                        sourceRef: event,
                        targetRef: event_,
                        $type: Flow_type.BPMN_SequenceFlow
                    };
                    this._compute_intermediate_event_execution(execution_flow, ...states);
                });
        } else {
            event.outgoing?.forEach((sequence_flow: Sequence_flow) => {
                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === event.id);
                /**
                 * Assign (basic) animation behavior for seq. flow.
                 */
                if (!status.validation.has(Validation.Reentrance)) {
                    const click: 'click' | 'dblclick' = this._is_message_flow_source(event, status)
                    || this._is_message_flow_target(event, status)
                    || status.type === Event_type.BPMN_IntermediateCatchSignalEvent
                        ? 'dblclick'
                        : 'click';
                    BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener(click, () => this.gen(sequence_flow.id));
                }
                event_as_state.transitions!.push({
                    event: sequence_flow.id,
                    onTransition: this._onTransition.bind(this, sequence_flow),
                    target: sequence_flow.targetRef!.id
                });
                if (BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_EventBasedGateway, states[states.length - 1]))
                    states.pop();
                // Recursive call:
                const status_ = this._compute_state(sequence_flow, ...states);
                if (status_.validation.has(Validation.Loopback)) {
                    const onTransition: () => void = event_as_state.transitions![event_as_state.transitions!.length - 1].onTransition!;
                    event_as_state.transitions![event_as_state.transitions!.length - 1].onTransition =
                        () => {
                            onTransition();
                            setTimeout(() => this._executor.gen(Validation.Loopback))
                        };
                }
                if (status_.validation.has(Validation.Reentrance)) // Last recorded transition target must change:
                    BPMiNer.Get_transition(sequence_flow.sourceRef!, sequence_flow.targetRef!, event_as_state)!.target = sequence_flow.targetRef!.id;
            });
            this._no_join(execution_flow, states[states.length - 1]);
        }
        return status;
    }

    private _compute_interruptible_boundary_event_as_state(event: Boundary_event, status: Event_status, superstate: SCION.State, ergonomcis: "'click'" | "'dblclick'"): SCION.State {
        const event_as_state: SCION.State = this._compute_flow_object_as_state(event, status, superstate);
        BPMiNer.Adjust_tooltip(event, status.type!, ergonomcis);
        const onExit: (scion_event?: SCION.Event) => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
        event_as_state.onExit = (scion_event?: SCION.Event) => {
            onExit();
            if (BPMiNer.Is_subprocess_(event.attachedToRef) && !this._is_collapsed_(event.attachedToRef)
                // 'Validation.Loopback' as scion.js event operates for "wrapping" states...
                // One then avoids that activity's embedded subprocess goes terminated at exiting time provoked by 'Validation.Loopback':
                && scion_event!.name !== Validation.Loopback)
                BPMiNer.Terminate_process(event.attachedToRef as Process);
        };
        // }
        return event_as_state;
    }

    private _compute_interruptible_boundary_event_execution(event: Boundary_event, me: ModdleElement, ...states: SCION.State[]): Event_status | never {
        if (BPMiNer.Trace) console.assert(event.$type === Event_type.BPMN_BoundaryEvent, "'_compute_interruptible_boundary_event_execution' >> 'event.$type === Event_type.BPMN_BoundaryEvent', untrue.");
        if (BPMiNer.Trace) console.assert(BPMiNer.Is_interruptible_boundary_event_(event), "'_compute_interruptible_boundary_event_execution' >> 'BPMiNer.Is_interruptible_boundary_event_(event)', untrue.");
        let event_id = event.id;
        const status = BPMiNer_process._Validate_event(event);
        if (status.validation.has(Validation.Boundary_event_non_executable_FORK_parallelism)
            || status.validation.has(Validation.Boundary_event_with_incoming_flow)
            || status.validation.has(Validation.Event_Unknown))
            throw new BPMN_error(event, ...Array.from(status.validation));
        BPMiNer.Compute_execution_path(me, event, status);
        if (BPMiNer.Trace) console.assert(!status.validation.has(Validation.Loopback), "'_compute_interruptible_boundary_event_execution' >> '!status.validation.has(Validation.Loopback)', untrue.");
        let click: 'click' | 'dblclick' = 'click';
        if (status.validation.has(Validation.Reentrance))
            event_id = event.id;
        else {
            if (BPMiNer.Is_subprocess_(event.attachedToRef))
                click = this._is_collapsed_(event.attachedToRef)
                || status.type === Event_type.BPMN_BoundaryConditionalEvent // No event throwing principle...
                || status.type === Event_type.BPMN_BoundaryTimerEvent // No event throwing principle...
                    ? 'click'
                    : 'dblclick';
            BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status),
                () => {
                    if (this.isIn(event_id))
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event(click)));
                });
            BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status) + event.attachedToRef.id,
                () => {
                    if (this.isIn(event_id))
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event(click)));
                });
        }
        const event_as_state: SCION.State = this._compute_interruptible_boundary_event_as_state(event, status, states[states.length - 1], `'${click}'`);
        event.outgoing?.forEach((sequence_flow: Sequence_flow) => {
            if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === event.id);
            /**
             * Assign (specific) animation behavior for direct outgoing seq. flows.
             */
            BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener(click, (me: MouseEvent) => {
                me.stopPropagation();
                if (this.isIn(event_id))
                    this.gen(sequence_flow.id);
            });
            event_as_state.transitions!.push({
                event: sequence_flow.id,
                onTransition: this._onTransition.bind(this, sequence_flow),
                target: sequence_flow.targetRef!.id
            });
            // 'Boundary_events.bpmn': 'A' activity must be created as exclusive state of 'X'...
            states.pop();
            // Recursive call:
            const status_ = this._compute_state(sequence_flow, ...states);
            if (status_.validation.has(Validation.Reentrance)) // Last recorded transition target must change:
                BPMiNer.Get_transition(sequence_flow.sourceRef!, sequence_flow.targetRef!, event_as_state)!.target = sequence_flow.targetRef!.id;
        });
        return status;
    }

    private _compute_non_interruptible_boundary_event_as_state(event: Boundary_event, status: Event_status, superstate: SCION.State, ergonomcis: "'click'" | "'dblclick'"): SCION.State {
        const event_as_state: SCION.State = this._compute_flow_object_as_state(event, status, superstate);
        BPMiNer.Adjust_tooltip(event, status.type!, ergonomcis);
        if (status.type === Event_type.BPMN_BoundaryCompensateEvent) {
            const onEntry: () => void = event_as_state.onEntry!;
            event_as_state.onEntry = () => {
                onEntry();
                BPMiNer.Get_compensations(event).forEach((association: Association) => BPMiNer.Kill_compensation(association));
            };
        }
        return event_as_state;
    }

    private _compute_non_interruptible_boundary_event_execution(event: Boundary_event, me: ModdleElement, execution_paths: Array<Association | Sequence_flow>, ...states: SCION.State[]): Event_status | never {
        if (BPMiNer.Trace) console.assert(event.$type === Event_type.BPMN_BoundaryEvent, "'_compute_non_interruptible_boundary_event_execution' >> 'event.$type === Event_type.BPMN_BoundaryEvent', untrue.");
        if (BPMiNer.Trace) console.assert(!BPMiNer.Is_interruptible_boundary_event_(event), "'_compute_non_interruptible_boundary_event_execution' >> '!BPMiNer.Is_interruptible_boundary_event_(event)', untrue.");
        let event_id = event.id;
        let click: 'click' | 'dblclick' = 'click';
        if (BPMiNer.Is_subprocess_(event.attachedToRef))
            click = this._is_collapsed_(event.attachedToRef) ? 'click' : 'dblclick';
        const status = BPMiNer_process._Validate_event(event);
        if (status.validation.has(Validation.Boundary_event_non_executable_FORK_parallelism)
            || status.validation.has(Validation.Boundary_event_with_incoming_flow)
            || status.validation.has(Validation.Event_Unknown))
            throw new BPMN_error(event, ...Array.from(status.validation));
        BPMiNer.Compute_execution_path(me, event, status);
        if (BPMiNer.Trace) console.assert(!status.validation.has(Validation.Loopback), "'_compute_non_interruptible_boundary_event_execution' >> '!status.validation.has(Validation.Loopback)', untrue.");
        if (status.validation.has(Validation.Reentrance))
            event_id = event.id;
        else {
            BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status),
                (event_) => {
                    if (this.isIn(event_id)) // Compensation boundary events do not have an 'outgoing' field so '?' instead of '!':
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event(click)));
                    /**
                     * Ver. 1.0.2: this JavaScript event is received when an intermediate throw compensation event is exited...
                     * Exit may unfortunately result from parent process exit *WITHOUT (from the business viewpoint) EFFECTIVE THROW*.
                     * Triggering compensation thus requires evaluation-based flag:
                     */
                    if ((event_ as CustomEvent<{ compensation: boolean }>).detail.compensation)
                        /** Associations from compensation boundary events, and thus compensation tasks, are considered as "final" **/
                        BPMiNer.Get_compensations(event).forEach((association: Association) => BPMiNer.Trigger_compensation(association));
                });
            BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status) + event.attachedToRef.id,
                () => {
                    if (this.isIn(event_id))
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event(click)));
                });
        }
        const event_as_state: SCION.State = this._compute_non_interruptible_boundary_event_as_state(event, status, states[states.length - 1], `'${click}'`);
        // See 'Boundary_events.png':
        const non_visual_state_id = BPMiNer.Create_id_for_non_visual_state_machine_element(event.id, status.basic_type);
        states[states.length - 1].states!.push({
            id: non_visual_state_id,
            onEntry: () => {
                if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(event.id))));
            },
            onExit: () => {
                if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(event.id))));
            }
        });
        execution_paths.forEach(sequence_flow =>
            event_as_state.transitions!.push({
                event: sequence_flow.id,
                onTransition: this._onTransition.bind(this, sequence_flow),
                target: non_visual_state_id
            }));
        /** Associations from compensation boundary events: **/
        BPMiNer.Get_compensations(event).forEach((association: Association) => {
            if (BPMiNer.Trace) console.assert(association.$type === Data_type.BPMN_Association && association.sourceRef!.id === event.id);
            event_as_state.transitions!.push({
                event: association.id,
                onTransition: this._onTransition.bind(this, association),
                target: association.targetRef!.id
            });
            // Recursive call:
            const status_ = this._compute_state(association, ...states);
            if (status_.validation.has(Validation.Reentrance)) // Last recorded transition target must change:
                BPMiNer.Get_transition(association.sourceRef!, association.targetRef!, event_as_state)!.target = association.targetRef!.id;
        });
        // Compensation boundary events do not have an 'outgoing' field so '?' instead of '!':
        event.outgoing?.forEach((sequence_flow: Sequence_flow) => {
            if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === event.id);
            /**
             * Assign (specific) animation behavior for direct outgoing seq. flows.
             */
            BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener(click, (me: MouseEvent) => {
                me.stopPropagation();
                if (this.isIn(event_id))
                    this.gen(sequence_flow.id);
            });
            event_as_state.transitions!.push({
                event: sequence_flow.id,
                onTransition: this._onTransition.bind(this, sequence_flow),
                target: sequence_flow.targetRef!.id
            });
            // Recursive call:
            const status_ = this._compute_state(sequence_flow, ...states);
            if (status_.validation.has(Validation.Reentrance)) // Last recorded transition target must change:
                BPMiNer.Get_transition(sequence_flow.sourceRef!, sequence_flow.targetRef!, event_as_state)!.target = sequence_flow.targetRef!.id;
        });
        return status;
    }

    private _compute_start_event_as_state(event: ModdleElement, status: Event_status, superstate: SCION.State): never | SCION.State {
        const event_as_state: SCION.State = this._compute_flow_object_as_state(event, status, superstate);
        /* Note: 'multiple' and 'parallel multiple' events appear as "blank" events without specific execution semantics */
        if (status.type === Event_type.BPMN_StartCompensateEvent) { // Non-interruptible by construction...
            if (!BPMiNer.Is_event_subprocess_(event.$parent))
                throw new BPMN_error(event, BPMN_error.Start_event_in_event_subprocess_only);
        }
        if (status.type === Event_type.BPMN_StartConditionalEvent || status.type === Event_type.BPMN_StartTimerEvent) {
            if (BPMiNer.Is_event_subprocess_(event.$parent) && BPMiNer.Is_interruptible_start_event_(event)) {
                const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
                event_as_state.onExit = () => {
                    onExit();
                    BPMiNer.Terminate_process(event.$parent.$parent, event.$parent); // To interrupt parent of event subprocess...
                };
            }
        }
        if (status.type === Event_type.BPMN_StartErrorEvent) { // Interruptible by construction...
            if (!BPMiNer.Is_event_subprocess_(event.$parent)) throw new BPMN_error(event, BPMN_error.Start_event_in_event_subprocess_only);
            const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
            event_as_state.onExit = () => {
                onExit();
                BPMiNer.Terminate_process(event.$parent.$parent, event.$parent); // To interrupt parent of event subprocess...
            };
            BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status) + event.$parent.$parent.id,
                () => {
                    if (this.isIn(event.id))
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                });
        }
        if (status.type === Event_type.BPMN_StartEscalationEvent) {
            if (!BPMiNer.Is_event_subprocess_(event.$parent)) throw new BPMN_error(event, BPMN_error.Start_event_in_event_subprocess_only);
            if (BPMiNer.Is_interruptible_start_event_(event)) {
                const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
                event_as_state.onExit = () => {
                    onExit();
                    BPMiNer.Terminate_process(event.$parent.$parent, event.$parent); // To interrupt parent of event subprocess...
                };
            }
            BPMiNer.Record_listener(BPMiNer.Get_communication_pattern(event, status) + event.$parent.$parent.id,
                () => {
                    if (this.isIn(event.id))
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                });
        }
        if (status.type === Event_type.BPMN_StartMessageEvent) {
            if (BPMiNer.Is_event_subprocess_(event.$parent) && BPMiNer.Is_interruptible_start_event_(event)) {
                const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
                event_as_state.onExit = () => {
                    onExit();
                    BPMiNer.Terminate_process(event.$parent.$parent, event.$parent); // To interrupt parent of event subprocess...
                };
            }
            const message_flows = this._message_flows.filter(message_flow => message_flow.targetRef === event);
            if (message_flows.length === 0) {
                BPMiNer.Record_listener(BPMiNer.Get_name_when_possible(event) + event.$parent.id,
                    () => {
                        if (this.isIn(event.id))
                            event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('click')));
                    });
                BPMiNer.Set_tooltip(event, "Receive_No_Message_Flows");
            } else {
                BPMiNer.Record_listener(BPMiNer.Get_original_id(event.id),
                    () => {
                        if (this._is_terminated_())
                            this.start(); // Can be restarting...
                        if (this.isIn(event.id))
                            event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                    });
                BPMiNer.Set_tooltip(event, "Receive_Message_Flows");
            }
        }
        if (status.type === Event_type.BPMN_StartSignalEvent) {
            if (BPMiNer.Is_event_subprocess_(event.$parent) && BPMiNer.Is_interruptible_start_event_(event)) {
                const onExit: () => void = event_as_state.onExit!; // 'onExit' has been set in '_compute_flow_object_as_state'...
                event_as_state.onExit = () => {
                    onExit();
                    BPMiNer.Terminate_process(event.$parent.$parent, event.$parent); // To interrupt parent of event subprocess...
                };
            }
            BPMiNer.Record_listener(BPMiNer.Get_name_when_possible(event),
                () => {
                    if (this.isIn(event.id))
                        event.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                });
        }
        return event_as_state;
    }

    private _compute_start_event_execution(event: ModdleElement, ...states: SCION.State[]): Event_status {
        const status: Event_status = BPMiNer_process._Validate_event(event);
        if (status.validation.has(Validation.Start_event_non_executable_FORK_parallelism)
            || status.validation.has(Validation.Start_event_with_incoming_flow)
            || status.validation.has(Validation.Event_Unknown))
            throw new BPMN_error(event, ...Array.from(status.validation));
        const event_as_state: SCION.State = this._compute_start_event_as_state(event, status, states[states.length - 1]);
        event.outgoing?.forEach((sequence_flow: Sequence_flow) => {
            if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === event.id);
            /**
             * Assign (basic) animation behavior for seq. flow.
             */
            if (!status.validation.has(Validation.Reentrance)) {
                const click: 'click' | 'dblclick' = status.type === Event_type.BPMN_StartErrorEvent
                || this._is_message_flow_target(event, status)
                || status.type === Event_type.BPMN_StartSignalEvent
                    ? 'dblclick'
                    : 'click';
                BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener(click, () => this._executor.gen(sequence_flow.id));
            }
            event_as_state.transitions!.push({
                event: sequence_flow.id,
                onTransition: this._onTransition.bind(this, sequence_flow),
                target: sequence_flow.targetRef!.id
            });
            // Recursive call:
            const status_ = this._compute_state(sequence_flow, ...states);
            if (status_.validation.has(Validation.Reentrance)) // Last recorded transition target must change:
                BPMiNer.Get_transition(sequence_flow.sourceRef!, sequence_flow.targetRef!, event_as_state)!.target = sequence_flow.targetRef!.id;
        });
        return status;
    }

    /**
     * End of events
     */

    private _create_region_in_parallel(fork: FORK, fork_as_state: SCION.Fork, ...states: Array<SCION.State>): Array<SCION.State> {
        if (BPMiNer.Trace) console.assert(fork_as_state.$type === BPMiNer.Parallel, "'_create_region_in_parallel' >> 'fork_as_state.$type === BPMiNer.Parallel', untrue.");
        // The concept of "region" comes from UML State Machine Diagrams:
        const region_in_parallel: Region_in_parallel = { // Each execution path as parallel region...
            FORK: fork, // This is a marker to keep information about what flow object (e.g., gateway) the region belongs to...
            states: new Array
        };
        fork_as_state.states!.push(region_in_parallel);
        const execution_stack: Array<SCION.State> = new Array(region_in_parallel); // As superstate (last position)...
        if (states.length > 0) {
            let i = states.length - 1; // 'states[states.length - 1]' must also be in...
            do {
                execution_stack.unshift(states[i--]);
            } while (i >= 0); // 'states[states.length - 2]' as option...
        }
        return execution_stack;
    }

    /**
     * Gateways
     */
    private static _Compute_event_based_gateway_type(gateway: Event_based_gateway): Gateway_type {
        if (BPMiNer.Trace) console.assert(gateway.$type === Gateway_type.BPMN_EventBasedGateway, "'_Compute_event_based_gateway_type' >> 'gateway.$type === Gateway_type.BPMN_EventBasedGateway', untrue.");
        return <Gateway_type>(gateway.$type + BPMiNer.BPMiNer_Separator + gateway.eventGatewayType);
    }

    private static _Validate_gateway(gateway: Readonly<ModdleElement>): Gateway_status {
        if (!Object.values(Gateway_type).includes(gateway.$type as Gateway_type)) // 'values' => ES2017!
            return {basic_type: <Gateway_type>gateway.$type, validation: new Set([Validation.Gateway_Unknown])};
        /**
         * Note that default seq. flows are gateways' attributes ('default?') and *NOT* recorded in seq. flows' attributes...
         * 'default' makes no sense for event-based gateways.
         */
        if (gateway.$type === Gateway_type.BPMN_EventBasedGateway) {
            /**
             * To be done: distinguish between exclusive and parallel event-based gateways:
             */
            if ('outgoing' in gateway && gateway.outgoing!.length > 1) {
                // 'outgoing' are caught events among 'Conditional', 'Message', 'Signal', 'Timer' and, 'ReceiveTask'...
                const targets = gateway.outgoing!.map(sequence_flow => sequence_flow.targetRef).filter(flow_object => {
                        if (flow_object!.$type.includes("Event")) {
                            const type = BPMiNer_process._Compute_event_type(flow_object!);
                            return type !== Event_type.BPMN_IntermediateCatchConditionalEvent &&
                                type !== Event_type.BPMN_IntermediateCatchMessageEvent &&
                                type !== Event_type.BPMN_IntermediateCatchSignalEvent &&
                                type !== Event_type.BPMN_IntermediateCatchTimerEvent
                        } else
                            return flow_object!.$type !== Activity_type.BPMN_ReceiveTask ? true : false;
                    }
                );
                return targets.length === 0
                    ? {
                        basic_type: <Gateway_type>gateway.$type,
                        type: BPMiNer_process._Compute_event_based_gateway_type(gateway as Event_based_gateway),
                        validation: new Set
                    }
                    : {
                        basic_type: <Gateway_type>gateway.$type,
                        validation: new Set([Validation.Event_based_gateway_with_inappropriate_outgoing_flow_object])
                    };
            }
            return {
                basic_type: <Gateway_type>gateway.$type,
                type: BPMiNer_process._Compute_event_based_gateway_type(gateway as Event_based_gateway),
                validation: new Set([Validation.Event_based_gateway_with_less_than_one_outgoing_flow])
            };
        }
        if (BPMiNer.Trace) console.assert(BPMiNer.Is_gateway_(gateway), "'_Validate_gateway' >> 'BPMiNer.Is_gateway_(gateway)', untrue.");
        if (BPMiNer.Is_FORK_gateway_(gateway))
            return {
                basic_type: <Gateway_type>gateway.$type,
                type: <Gateway_type>(gateway.$type + BPMiNer.BPMiNer_Separator + BPMiNer.FORK),
                validation: new Set
            };
        if (BPMiNer.Is_JOIN_gateway_(gateway))
            return {
                basic_type: <Gateway_type>gateway.$type,
                type: <Gateway_type>(gateway.$type + BPMiNer.BPMiNer_Separator + BPMiNer.JOIN),
                validation: new Set
            };
        return {
            basic_type: <Gateway_type>gateway.$type,
            type: <Gateway_type>gateway.$type,
            validation: new Set([Validation.Gateway_neither_FORK_nor_JOIN])
        };
    }

    private _compute_event_based_gateway_execution(execution_flow: Sequence_flow, ...states: SCION.State[]): Gateway_status | never {
        const event_based_gateway: Event_based_gateway = execution_flow.targetRef! as Event_based_gateway;
        if (BPMiNer.Trace) console.assert(event_based_gateway.$type === Gateway_type.BPMN_EventBasedGateway, "'_compute_event_based_gateway_execution' >> 'gateway.$type === Gateway_type.BPMN_EventBasedGateway', untrue.");
        const status: Gateway_status = BPMiNer_process._Validate_gateway(event_based_gateway);

        /** Only exclusive event-based gateway for the moment */
        if (BPMiNer.Trace) console.assert(status.type === Gateway_type.BPMN_EventBasedGatewayExclusive);
        /** Only exclusive event-based gateway for the moment */

        if (status.validation.has(Validation.Gateway_Unknown) || status.validation.has(Validation.Event_based_gateway_with_inappropriate_outgoing_flow_object))
            throw new BPMN_error(event_based_gateway, ...Array.from(status.validation));
        BPMiNer.Compute_execution_path(execution_flow, execution_flow.targetRef!, status);
        if (status.validation.has(Validation.Loopback))
            return status;
        const event_based_gateway_as_state: SCION.State = this._compute_flow_object_as_state(event_based_gateway, status, states[states.length - 1]);
        /**
         * One *CANNOT* click on an event-based gateway.
         * However, *ALL* outgoing seq. flows have to look like "FLOW_TRIGGERED" at entering time.
         */
        const onEntry: () => void = event_based_gateway_as_state.onEntry!; // 'onEntry' has been set in '_compute_flow_object_as_state'...
        event_based_gateway_as_state.onEntry = () => {
            onEntry();
            event_based_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => BPMiNer.Trigger_force(sequence_flow));
        };
        event_based_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => {
            if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === event_based_gateway.id);
            const execution_stack: Array<SCION.State> = this._create_region_in_parallel(event_based_gateway, event_based_gateway_as_state as SCION.Fork, ...states);
            // Recursive call:
            const status_ = this._compute_state(sequence_flow, ...execution_stack);
            /* From the executor viewpoint, event-based gateways have *NO* outgoing transitions. So, erroneous: */
            // if (status_.validation.has(Validation.Reentrance)) // Last recorded transition target must change:
            //     ...
        });
        return status;
    }

    // Utility method for '_join':
    private static _Compute_guards_(join_gateway: Gateway, execution_flow: Sequence_flow, region_in_parallel: Region_in_parallel): Array<string> {
        if (execution_flow.sourceRef!.$type === Gateway_type.BPMN_ParallelGateway && BPMiNer.Is_FORK_gateway_(execution_flow.sourceRef!))
            return new Array();
        if (BPMiNer.Is_FORK_gateway_(execution_flow.sourceRef!))
            return execution_flow.sourceRef!.outgoing!.filter(sequence_flow => sequence_flow !== execution_flow)
                .map(sequence_flow => BPMiNer.Clean_up_id(BPMiNer.Create_id_for_non_visual_state_machine_element(sequence_flow.targetRef!.id)));
        return (join_gateway.$type === Gateway_type.BPMN_ComplexGateway || join_gateway.$type === Gateway_type.BPMN_InclusiveGateway)
            ? join_gateway.incoming!.filter(sequence_flow => sequence_flow !== execution_flow) // e.g., excludes 'T1+@T1+' for 'T1+'
                .map(sequence_flow => {
                    if (sequence_flow.sourceRef !== region_in_parallel.FORK)
                        return BPMiNer.Clean_up_id(BPMiNer.Create_id_for_non_visual_state_machine_element(sequence_flow.sourceRef!.id));
                    return BPMiNer.Clean_up_id(BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Create_id_for_non_visual_state_machine_element(sequence_flow.sourceRef!.id, join_gateway.id)));
                })
            : join_gateway.incoming!.map(sequence_flow => {
                if (sequence_flow.sourceRef !== region_in_parallel.FORK)
                    return BPMiNer.Clean_up_id(BPMiNer.Create_id_for_non_visual_state_machine_element(sequence_flow.sourceRef!.id));
                return BPMiNer.Clean_up_id(BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Create_id_for_non_visual_state_machine_element(sequence_flow.sourceRef!.id, join_gateway.id)));
            });
    }

    private _join(join_gateway: Gateway, execution_flow: Sequence_flow, states: SCION.State[]): never | SCION.State {
        let region_in_parallel: Region_in_parallel = states.pop() as Region_in_parallel;
        if (BPMiNer.Trace) console.assert(region_in_parallel, "'_join' >> 'region_in_parallel', untrue.");
        if (!BPMiNer.Is_region_in_parallel_(region_in_parallel))
            throw new BPMN_error(join_gateway, BPMN_error.No_detected_region_in_parallel);

        if (execution_flow.sourceRef === region_in_parallel.FORK && BPMiNer.Is_activity_forked_(region_in_parallel)) {
            if (BPMiNer.Is_region_in_parallel_(states[states.length - 1])) {
                // 'Exclusive_gateway_.bpmn': 'Subprocess'
                region_in_parallel = states.pop() as Region_in_parallel;
                if (BPMiNer.Trace) console.assert(region_in_parallel, "'_join' >> 'region_in_parallel', untrue.");
            } else // 'Exclusive_gateway___.bpmn': 'Activity'
                return states[states.length - 1];
        }
        // Try to reach superstate:
        while (BPMiNer.Is_gateway_forked_(join_gateway.$type as Gateway_type, states[states.length - 1]))
            states.pop();
        if (states.length === 0)
            throw new BPMN_error(join_gateway, BPMN_error.No_detected_execution_context);

        if (execution_flow.sourceRef !== region_in_parallel.FORK) {
            /** TEST CASES: 'A.2.1.bpmn', 'Exclusive_gateway.bpmn', 'Exclusive_gateway_.bpmn', 'Inclusive_gateway.bpmn',
             * 'Inclusive_gateway_.bpmn', 'Inclusive_gateway__.bpmn', 'Meeting.bpmn', 'Spend_night_time_XOR.bpmn'
             */
                // 'Inclusive_gateway_.bpmn', get 'T1+':
            let final_flow_object_as_state = BPMiNer.Get_final_flow_object_as_state(region_in_parallel);
            if (!final_flow_object_as_state)
                throw new BPMN_error(join_gateway, BPMN_error.No_detected_state);
            // If 'final_flow_object_as_state' is wrapping state then get activity state id.:
            final_flow_object_as_state = BPMiNer.Get_state(execution_flow.sourceRef!, final_flow_object_as_state)!;
            const final_flow_object: ModdleElement = this._get_model_element(BPMiNer.Get_original_name(final_flow_object_as_state.id!));

            // 'Inclusive_gateway_.bpmn', get 'T1' (more generally: get first flow object in 'region_in_parallel'):
            const initial_flow_object_as_state: SCION.State = BPMiNer.Get_initial_flow_object_as_state(region_in_parallel);
            // 'Exclusive_gateway_.bpmn', 'Activity_0lqcf36@Loopback' -> 'Activity_0lqcf36'
            const initial_flow_object: ModdleElement = this._get_model_element(BPMiNer.Get_original_name(initial_flow_object_as_state.id!));

            /** 'Event_based_gateway__.bpmn': 'Ebg@Ebg' must be created once and for all... */
            const non_visual_state_id = BPMiNer.Is_event_based_gateway_(initial_flow_object)
                ? BPMiNer.Create_id_for_non_visual_state_machine_element(initial_flow_object.id)
                : BPMiNer.Create_id_for_non_visual_state_machine_element(final_flow_object.id);

            /** 'A.2.1.bpmn': 'final_flow_object_as_state' is 'Task 3'
             * while 'initial_flow_object_as_state' is 'Task 2@Task 2'
             */
            if (!BPMiNer.Is_non_visual_state_id_(initial_flow_object_as_state.id)
                || BPMiNer.Is_activity_wrapping_(initial_flow_object_as_state)
                || BPMiNer.Is_event_based_gateway_(initial_flow_object)) {
                if (initial_flow_object.hasOwnProperty('incoming')) { // Mandatory: 'Meeting.bpmn'
                    /** 'Event_based_gateway__.bpmn': 'Ebg@Ebg' must be created once and for all: */
                    if (!BPMiNer.Is_event_based_gateway_(initial_flow_object) || !BPMiNer.Is_non_visual_state_id_(initial_flow_object_as_state.id)) {
                        // 'Inclusive_gateway_.bpmn', add non-visual state 'T1+@T1+' *BEFORE* 'T1+' (*MUST BE* initial execution state, so 'unshift'):
                        region_in_parallel.states.unshift(
                            {
                                id: non_visual_state_id,
                                onEntry: () => {
                                    if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(final_flow_object.id))));
                                },
                                onExit: () => {
                                    if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(final_flow_object.id))));
                                },
                                transitions: new Array
                            });
                        // Create fake transition(s) 'T1+@T1+ -c1-> T1':
                        initial_flow_object.incoming!.forEach(sequence_flow => BPMiNer.Get_initial_flow_object_as_state(region_in_parallel).transitions!.push({
                            event: sequence_flow.id, // e.g., 'c1'
                            target: initial_flow_object_as_state.id! // Caution: "wrapping" state in case of activity with boundary events...
                        }));
                    }
                    /* 'T1+ -a-> JOIN' gets guard */
                    const transition = BPMiNer.Get_transition(execution_flow.sourceRef!, execution_flow.targetRef!, final_flow_object_as_state);
                    if (!transition)
                        throw new BPMN_error(join_gateway, BPMN_error.No_detected_transition);
                    const guards = BPMiNer_process._Compute_guards_(join_gateway, execution_flow, region_in_parallel);
                    // JOIN inclusive gateway is conditionally reachable ('T1+ -a[cond]-> JOIN inclusive gateway'):
                    transition.cond = (event: SCION.Event): boolean => {
                        const configuration = this.getConfiguration().map(state_id => BPMiNer.Clean_up_id(state_id));
                        let guard: boolean = true;
                        guards.forEach(state_id => guard = guard && configuration.includes(state_id)); // e.g., in ['T2@T2','T3@T3']?

                        /** TEST */
                        // let config: string = "";
                        // this.getConfiguration().forEach(state_id => {
                        //     if (!state_id.includes(BPMiNer.Generated_state))
                        //         config += state_id.split(BPMiNer.BPMiNer_Separator)
                        //             .map((state_id: string) => {
                        //                 try {
                        //                     const me = this._get_model_element(state_id);
                        //                     return BPMiNer.Get_name_when_possible(me);
                        //                 } catch (error: unknown) { // 'state_id' is not actually a state id.:
                        //                     return "";
                        //                 }
                        //             })
                        //             .join(BPMiNer.BPMiNer_Separator) + " && ";
                        // });
                        // let cond_: string = "";
                        // guards.forEach(state_id => {
                        //     cond_ += state_id.split(BPMiNer.BPMiNer_Separator)
                        //         .map((state_id: string) => BPMiNer.Get_name_when_possible(this._get_model_element(state_id)))
                        //         .join(BPMiNer.BPMiNer_Separator) + " && ";
                        // });
                        // alert("Active conf.: " + config + "\n\nExpected cond.: " + cond_ + "\n\nGuard: " + guard + " ('false' for 'Gateway_type.BPMN_ExclusiveGateway')");
                        /** End of TEST */

                        return (join_gateway.$type === Gateway_type.BPMN_ComplexGateway || join_gateway.$type === Gateway_type.BPMN_InclusiveGateway)
                            ? guard
                            : !guard; /* 'Gateway_type.BPMN_ExclusiveGateway' */
                    };
                    // JOIN gateway is not yet reachable ('T1+ -a-> T1+@T1+'):
                    final_flow_object_as_state!.transitions!.push({
                        event: transition.event, // e.g., 'a'
                        onTransition: this._onTransition.bind(this, this._get_model_element(transition.event)),
                        target: non_visual_state_id // e.g., 'T1+@T1+'
                    });
                }
            }
        } else {
            /**
             * TEST CASES: 'TEST_CASE_1.bpmn' ('EXC1@EXC3' & 'EXC2@EXC3'), 'TEST_CASE_2.bpmn' ('INC1@JOIN INC.' & 'INC2@JOIN INC.'),
             * 'TEST_CASE_2a.bpmn' ('FORK INC.@JOIN INC.' & 'FORK PAR.@JOIN INC.')
             */
            const non_visual_state_id = /*'FORK INC.@JOIN INC.'*/ BPMiNer.Create_id_for_non_visual_state_machine_element(execution_flow.sourceRef.id, join_gateway.id);
            const guards = BPMiNer_process._Compute_guards_(join_gateway, execution_flow, region_in_parallel);
            region_in_parallel.states!.push({
                id: non_visual_state_id,
                onEntry: () => {
                    setTimeout(() => {
                        this.gen(execution_flow.id);
                        if (BPMiNer.Trace) console.info("\t\tonEntry ^" + BPMiNer.Get_name_when_possible(execution_flow) + " in " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Activity | Gateway)),
                            BPMiNer.Get_name_when_possible(join_gateway)));
                    });
                },
                onExit: () => {
                    if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Activity | Gateway)),
                        BPMiNer.Get_name_when_possible(join_gateway)));
                },
                transitions: new Array({
                    cond: (event_: SCION.Event): boolean => {
                        const configuration = this.getConfiguration().map(state_id => BPMiNer.Clean_up_id(state_id));
                        let guard: boolean = true;
                        guards.forEach(state_id => guard = guard && configuration.includes(state_id));

                        /** TEST */
                        // let config: string = "";
                        // this.getConfiguration().forEach(state_id => {
                        //     if (!state_id.includes(BPMiNer.Generated_state))
                        //         config += state_id.split(BPMiNer.BPMiNer_Separator)
                        //             .map((state_id: string) => {
                        //                 try {
                        //                     const me = this._get_model_element(state_id);
                        //                     return BPMiNer.Get_name_when_possible(me);
                        //                 } catch (error: unknown) { // 'state_id' is not actually a state id.:
                        //                     return "";
                        //                 }
                        //             })
                        //             .join(BPMiNer.BPMiNer_Separator) + " && ";
                        // });
                        // let cond_: string = "";
                        // guards.forEach(state_id => {
                        //     cond_ += state_id.split(BPMiNer.BPMiNer_Separator)
                        //         .map((state_id: string) => BPMiNer.Get_name_when_possible(this._get_model_element(state_id)))
                        //         .join(BPMiNer.BPMiNer_Separator) + " && ";
                        // });
                        // alert("Active conf.: " + config + "\n\nExpected cond.: " + cond_ + "\n\nGuard: " + guard);
                        /** End of TEST */

                        return guard;
                    },
                    event: execution_flow.id,
                    onTransition: this._onTransition.bind(this, execution_flow),
                    target: join_gateway.id
                })
            });
            if (!BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ParallelGateway, region_in_parallel)) {
                const non_visual_state_id_ = /*'FORK INC.@JOIN INC.@FORK INC.@JOIN INC.'*/ BPMiNer.Create_id_for_non_visual_state_machine_element(non_visual_state_id);
                region_in_parallel.states.unshift({ // 'unshift' => initial active state...
                    id: non_visual_state_id_,
                    onEntry: () => {
                        if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Activity | Gateway)),
                                BPMiNer.Get_name_when_possible(join_gateway)),
                            BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Activity | Gateway)),
                                BPMiNer.Get_name_when_possible(join_gateway))));
                    },
                    onExit: () => {
                        if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Gateway)),
                                BPMiNer.Get_name_when_possible(join_gateway)),
                            BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Gateway)),
                                BPMiNer.Get_name_when_possible(join_gateway))));
                    },
                    transitions: new Array({
                        event: execution_flow.id,
                        onTransition: this._onTransition.bind(this, execution_flow),
                        target: non_visual_state_id
                    })
                });
            }
        }
        return states[states.length - 1];
    }

    // Utility method for '_join_parallel':
    private static _Compute_guards(join_gateway: Gateway, execution_flow: Sequence_flow, region_in_parallel: Region_in_parallel): Array<string> {
        return join_gateway.incoming!.filter(sequence_flow => sequence_flow !== execution_flow) // e.g., excludes 'T1+@T1+' for 'T1+'
            /** Trade-off between 'NYC_MOMA_drop_off' and 'Parallel_inclusive_gateway.bpmn' (see 2nd test member)
             * 'NYC_MOMA_drop_off.bpmn': 'G3 -> G4' leads to 'G3@G4'
             * 'Parallel_inclusive_gateway.bpmn': 'JOIN inc. -> JOIN par.' leads to 'JOIN inc.@JOIN inc.' *AND NOT* 'JOIN inc.@JOIN par.'
             * because 'JOIN inc.' is not by construction a FORK gateway...
             */
            .map(sequence_flow => {
                    return (sequence_flow.sourceRef === region_in_parallel.FORK || BPMiNer.Is_FORK_gateway_(sequence_flow.sourceRef!))
                        // 'NYC_MOMA_drop_off.bpmn' ('G3@G4'), 'NYC_MOMA_drop_off_.bpmn' ('G5@G4'):
                        ? BPMiNer.Clean_up_id(BPMiNer.Create_id_for_non_visual_state_machine_element(sequence_flow.sourceRef!.id, join_gateway.id))
                        // 'NYC_MOMA_drop_off.bpmn' ('Tell phone number@Tell phone number'):
                        : BPMiNer.Clean_up_id(BPMiNer.Create_id_for_non_visual_state_machine_element(sequence_flow.sourceRef!.id));
                }
            );
    }

    private _join_parallel(join_gateway: Gateway, execution_flow: Sequence_flow, states: SCION.State[]): never | SCION.State {
        let region_in_parallel: Region_in_parallel = states.pop() as Region_in_parallel;
        if (BPMiNer.Trace) console.assert(region_in_parallel, "'_join' >> 'region_in_parallel', untrue.");
        if (!BPMiNer.Is_region_in_parallel_(region_in_parallel))
            throw new BPMN_error(join_gateway, BPMN_error.No_detected_region_in_parallel);

        if (execution_flow.sourceRef === region_in_parallel.FORK && BPMiNer.Is_activity_forked_(region_in_parallel)) {
            if (BPMiNer.Is_region_in_parallel_(states[states.length - 1])) {
                // 'Parallel_gateway__.bpmn': 'Subprocess'
                region_in_parallel = states.pop() as Region_in_parallel;
                if (BPMiNer.Trace) console.assert(region_in_parallel, "'_join' >> 'region_in_parallel', untrue.");
            } else // 'Car.bpmn': 'Drive'
                return states[states.length - 1];
        }
        // Try to reach superstate:
        while (BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ParallelGateway, states[states.length - 1]))
            states.pop();
        /** 'B.2.0.bpmn': merge is parallel gateway while fork is inclusive (bad anyway): */
        while (BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_InclusiveGateway, states[states.length - 1]))
            states.pop();
        if (states.length === 0)
            throw new BPMN_error(join_gateway, BPMN_error.No_detected_execution_context);

        if (execution_flow.sourceRef !== region_in_parallel.FORK) {
            /**
             * TEST CASES: 'Mom_Dad_parallel.bpmn', 'Parallel_gateway.bpmn', 'Parallel_gateway_.bpmn', 'Parallel_gateway__.bpmn',
             * 'Parallel_inclusive_gateway.bpmn', 'Rendez_vous.bpmn', 'Rendez_vous_.bpmn', 'Rendez_vous__.bpmn', 'Spend_night_time_AND.bpmn'
             */
                // 'Parallel_gateway_.bpmn', get 'T1+':
            let final_flow_object_as_state = BPMiNer.Get_final_flow_object_as_state(region_in_parallel);
            if (!final_flow_object_as_state)
                throw new BPMN_error(join_gateway, BPMN_error.No_detected_state);
            // If 'final_flow_object_as_state' is wrapping state then get activity state id.:
            final_flow_object_as_state = BPMiNer.Get_state(execution_flow.sourceRef!, final_flow_object_as_state)!;
            // Add non-visual state *AFTER* 'T1+':
            const non_visual_state_id = BPMiNer.Create_id_for_non_visual_state_machine_element(final_flow_object_as_state.id); // e.g., 'T1+@T1+'
            region_in_parallel.states.push({
                id: non_visual_state_id,
                onEntry: () => {
                    // 'Rendez_vous__.bpmn': entering '8.00 pm@8.00 pm' prevents the sending of 'time-out' => '7.45 pm' remains active while *IT MUST NOT*
                    // So, simulate 'time-out':
                    setTimeout(() => { // alert(BPMiNer.Get_name_when_possible(execution_flow));
                        this._executor.gen(execution_flow.id);
                        if (BPMiNer.Trace) console.info("\t\tonEntry ^" + BPMiNer.Get_name_when_possible(execution_flow) + " in " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(final_flow_object_as_state!.id))));
                    });
                },
                onExit: () => {
                    if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(final_flow_object_as_state!.id))));
                },
                transitions: new Array
            });
            /* 'T1+ -a-> JOIN' gets guard */
            const transition = BPMiNer.Get_transition(execution_flow.sourceRef!, execution_flow.targetRef!, final_flow_object_as_state);
            if (!transition)
                throw new BPMN_error(join_gateway, BPMN_error.No_detected_transition);
            const guards = BPMiNer_process._Compute_guards(join_gateway, execution_flow, region_in_parallel);
            final_flow_object_as_state.transitions!.unshift({ // 'unshift' -> first position because of SCION limitations...
                cond: (event: SCION.Event): boolean => {
                    const configuration = this._executor.getConfiguration().map(state_id => BPMiNer.Clean_up_id(state_id));
                    let guard: boolean = true;
                    guards.forEach(state_id => guard = guard && configuration.includes(state_id));

                    /** TEST */
                    // let config: string = "";
                    // this._executor.getConfiguration().forEach(state_id => {
                    //     if (!state_id.includes(BPMiNer.Generated_state))
                    //         config += state_id.split(BPMiNer.BPMiNer_Separator)
                    //             .map((state_id: string) => {
                    //                 try {
                    //                     const me = this._get_model_element(state_id);
                    //                     return BPMiNer.Get_name_when_possible(me);
                    //                 } catch (error: unknown) { // 'state_id' is not actually a state id.:
                    //                     return "";
                    //                 }
                    //             })
                    //             .join(BPMiNer.BPMiNer_Separator) + " && ";
                    // });
                    // let cond_: string = "";
                    // guards.forEach(state_id => {
                    //     cond_ += state_id.split(BPMiNer.BPMiNer_Separator)
                    //         .map(state_id => BPMiNer.Get_name_when_possible(this._get_model_element(state_id)))
                    //         .join(BPMiNer.BPMiNer_Separator) + " && ";
                    // });
                    // alert("Active conf.: " + config + "\n\n" + "Expected cond.: " + cond_ + "\n\nGuard: " + guard);
                    /** End of TEST */

                    return !guard;
                },
                event: transition.event, // e.g., 'a'
                onTransition: this._onTransition.bind(this, this._get_model_element(transition.event)),
                target: non_visual_state_id // e.g., 'T1+@T1+'
            });
        } else {
            /**
             * 'TEST_CASE_3.bpmn': 'FORK PAR.1'-->'JOIN PAR.' and 'FORK PAR.2'-->'JOIN PAR.'
             * 'TEST_CASE_3a.bpmn': 'FORK PAR'-->'JOIN PAR.' and 'FORK INC.'-->'JOIN PAR.'
             */
            const non_visual_state_id = BPMiNer.Create_id_for_non_visual_state_machine_element(execution_flow.sourceRef.id, join_gateway.id);
            const guards = BPMiNer_process._Compute_guards(join_gateway, execution_flow, region_in_parallel);
            region_in_parallel.states.push({
                id: non_visual_state_id,
                onEntry: () => {
                    if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Activity | Gateway)),
                        BPMiNer.Get_name_when_possible(join_gateway)));
                },
                onExit: () => {
                    if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Activity | Gateway)),
                        BPMiNer.Get_name_when_possible(join_gateway)));
                },
                transitions: new Array({
                    cond: (event: SCION.Event): boolean => {
                        const configuration = this._executor.getConfiguration().map(state_id => BPMiNer.Clean_up_id(state_id));
                        let guard: boolean = true;
                        guards.forEach(state_id => guard = guard && configuration.includes(state_id));

                        /** TEST */
                        // let config: string = "";
                        // this._executor.getConfiguration().forEach(state_id => {
                        //     if (!state_id.includes(BPMiNer.Generated_state))
                        //         config += state_id.split(BPMiNer.BPMiNer_Separator)
                        //             .map((state_id: string) => {
                        //                 try {
                        //                     const me = this._get_model_element(state_id);
                        //                     return BPMiNer.Get_name_when_possible(me);
                        //                 } catch (error: unknown) { // 'state_id' is not actually a state id.:
                        //                     return "";
                        //                 }
                        //             })
                        //             .join(BPMiNer.BPMiNer_Separator) + " && ";
                        // });
                        // let cond_: string = "";
                        // guards.forEach(state_id => {
                        //     cond_ += state_id.split(BPMiNer.BPMiNer_Separator)
                        //         .map(state_id => BPMiNer.Get_name_when_possible(this._get_model_element(state_id)))
                        //         .join(BPMiNer.BPMiNer_Separator) + " && ";
                        // });
                        // alert("Active conf.: " + config + "\n\n" + "Expected cond.: " + cond_ + "\n\nGuard: " + guard);
                        /** End of TEST */

                        return guard;
                    },
                    event: execution_flow.id,
                    target: join_gateway.id
                })
            });
            if (BPMiNer.Is_gateway_forked_(Gateway_type.BPMN_ParallelGateway, region_in_parallel)) {
                // Pass through transition (i.e., 'completion') in an automatic way:
                const onEntry: () => void = BPMiNer.Get_final_flow_object_as_state(region_in_parallel, true)!.onEntry!;
                BPMiNer.Get_final_flow_object_as_state(region_in_parallel, true)!.onEntry = () => {
                    onEntry();
                    setTimeout(() => {
                        this._executor.gen(execution_flow.id);
                        if (BPMiNer.Trace) console.info("\t\tonEntry ^" + BPMiNer.Get_name_when_possible(execution_flow) + " in " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible((region_in_parallel.FORK as Activity | Gateway)),
                            BPMiNer.Get_name_when_possible(join_gateway)));
                    });
                };
            }
        }
        return states[states.length - 1];
    }

    private _compute_exclusive_gateway_execution(execution_flow: Sequence_flow, ...states: SCION.State[]): Gateway_status | never {
        const exclusive_gateway: Gateway = execution_flow.targetRef! as Gateway;
        if (BPMiNer.Trace) console.assert(exclusive_gateway.$type === Gateway_type.BPMN_ExclusiveGateway);
        let exclusive_gateway_id = exclusive_gateway.id;
        const status: Gateway_status = BPMiNer_process._Validate_gateway(exclusive_gateway);
        if (status.validation.has(Validation.Gateway_Unknown) || status.validation.has(Validation.Gateway_neither_FORK_nor_JOIN))
            throw new BPMN_error(exclusive_gateway, ...Array.from(status.validation));
        if (status.type === Gateway_type.BPMN_ExclusiveGatewayFORK) {
            BPMiNer.Compute_execution_path(execution_flow, execution_flow.targetRef!, status);
            if (status.validation.has(Validation.Loopback)) {
                if (BPMiNer.Trace) console.warn(BPMiNer.Get_name_when_possible(exclusive_gateway) + ": status.validation.has(Validation.Loopback)");
                return status;
            }
            if (status.validation.has(Validation.Reentrance))
                exclusive_gateway_id = exclusive_gateway.id;
            const exclusive_gateway_as_state: SCION.State = this._compute_flow_object_as_state(exclusive_gateway, status, states[states.length - 1]);
            /**
             * One may click on an exclusive FORK gateway provided that it exists a seq. flow set to 'default'.
             */
            const default_: Sequence_flow | undefined = exclusive_gateway['default'];
            if (default_)
                BPMiNer.Set_tooltip(exclusive_gateway, "ExclusiveGatewayFORK_with_default");
            BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(exclusive_gateway.id))!.addEventListener('click', (me: MouseEvent) => {
                me.stopPropagation();
                const triggered: Sequence_flow | undefined = exclusive_gateway.outgoing!.find((sequence_flow: Sequence_flow) => BPMiNer.Is_triggered(sequence_flow))
                const trigger: Sequence_flow | undefined = triggered !== undefined ? triggered : default_ !== undefined ? default_ : undefined;
                if (trigger !== undefined) {
                    if (this.isIn(exclusive_gateway_id)) {
                        this._executor.gen(trigger.id);
                        if (trigger === default_) // May be omitted...
                            BPMiNer.Trigger(trigger);
                        exclusive_gateway.outgoing!.filter((sequence_flow: Sequence_flow) => sequence_flow !== trigger)
                            .forEach((sequence_flow: Sequence_flow) => {
                                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === exclusive_gateway.id);
                                BPMiNer.Kill(sequence_flow);
                            });
                    }
                }
            });
            exclusive_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => {
                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === exclusive_gateway.id);
                /**
                 * Assign (specific) animation behavior for direct outgoing seq. flows.
                 * Note that BPMN "default" seq. flows *DO NOT* react to 'click'.
                 */
                if (default_ === undefined || (default_ !== undefined && sequence_flow.id !== default_.id))
                    BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener('click', (me: MouseEvent) => {
                        me.stopPropagation();
                        if (this.isIn(exclusive_gateway_id)) {
                            /* One simulates the fact one clicks on the gateway itself: */
                            BPMiNer.Trigger(sequence_flow);
                            BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(exclusive_gateway.id)).dispatchEvent(new Event('click'));
                        }
                    });
                const execution_stack: Array<SCION.State> = this._create_region_in_parallel(exclusive_gateway, exclusive_gateway_as_state as SCION.Fork, ...states);
                // Recursive call:
                const status_ = this._compute_state(sequence_flow, ...execution_stack);
                if (status_.validation.has(Validation.Loopback))
                    exclusive_gateway_as_state.transitions!.push({
                        event: sequence_flow.id,
                        // When reentering activity, make non-interruptible boundary events again active:
                        onTransition: () => setTimeout(() => this._executor.gen(Validation.Loopback)),
                        target: sequence_flow.targetRef!.id
                    });
                else
                    this._no_join(sequence_flow, states[states.length - 1]);
            });
        } else if (status.type === Gateway_type.BPMN_ExclusiveGatewayJOIN) {
            BPMiNer.Compute_execution_path_JOIN(execution_flow, status, states);
            const superstate = this._join(exclusive_gateway, execution_flow, states);
            if (BPMiNer.Get_state(exclusive_gateway, ...states)) // JOIN exclusive gateway has already been processed?
                return status;
            const exclusive_gateway_as_state: SCION.State = this._compute_flow_object_as_state(exclusive_gateway, status, superstate);
            exclusive_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => {
                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === exclusive_gateway.id);
                /**
                 * Assign (basic) animation behavior for seq. flow.
                 */
                if (!status.validation.has(Validation.Reentrance))
                    BPMiNer.Get_SVGGElement(sequence_flow.id)!.addEventListener('click', () => this._executor.gen(sequence_flow.id));
                exclusive_gateway_as_state.transitions!.push({
                    event: sequence_flow.id,
                    onTransition: this._onTransition.bind(this, sequence_flow),
                    target: BPMiNer.Pseudo_reenter(sequence_flow)
                });
                // Recursive call:
                const status_ = this._compute_state(sequence_flow, ...states);
            });
        }
        return status;
    }

    /* Inspiration: 'TEST_CASES/Inclusive_gateway.ts' */
    private _compute_inclusive_gateway_execution(execution_flow: Sequence_flow, ...states: SCION.State[]): Gateway_status | never {
        const inclusive_gateway: Gateway = execution_flow.targetRef! as Gateway;
        if (BPMiNer.Trace) console.assert(inclusive_gateway.$type === Gateway_type.BPMN_ComplexGateway || inclusive_gateway.$type === Gateway_type.BPMN_InclusiveGateway);
        let inclusive_gateway_id = inclusive_gateway.id;
        const status: Gateway_status = BPMiNer_process._Validate_gateway(inclusive_gateway);
        if (status.validation.has(Validation.Gateway_Unknown) || status.validation.has(Validation.Gateway_neither_FORK_nor_JOIN))
            throw new BPMN_error(inclusive_gateway, ...Array.from(status.validation));
        if (status.type === Gateway_type.BPMN_ComplexGatewayFORK || status.type === Gateway_type.BPMN_InclusiveGatewayFORK) {
            BPMiNer.Compute_execution_path(execution_flow, execution_flow.targetRef!, status);
            if (status.validation.has(Validation.Loopback)) {
                if (BPMiNer.Trace) console.warn(BPMiNer.Get_name_when_possible(inclusive_gateway) + ": status.validation.has(Validation.Loopback)");
                return status;
            }
            if (status.validation.has(Validation.Reentrance))
                inclusive_gateway_id = inclusive_gateway.id;
            const inclusive_gateway_as_state: SCION.State = this._compute_flow_object_as_state(inclusive_gateway, status, states[states.length - 1]);
            /**
             * One may click on an inclusive FORK gateway provided that it exists an outgoing seq. flow set to 'default'.
             * Beyond, one *MUST* click on it provided that at least one outgoing seq. flow is set to 'true'.
             */
            const default_: Sequence_flow | undefined = inclusive_gateway['default'];
            if (default_)
                BPMiNer.Set_tooltip(inclusive_gateway, "InclusiveGatewayFORK_with_default");
            BPMiNer.Get_SVGGElement(BPMiNer.Get_original_id(inclusive_gateway.id))!.addEventListener('click', (me: MouseEvent) => {
                me.stopPropagation();
                const triggerable: Array<Sequence_flow> = inclusive_gateway.outgoing!.filter((sequence_flow: Sequence_flow) => BPMiNer.Is_triggerable_(sequence_flow))
                const trigger: Array<Sequence_flow> | undefined = triggerable.length !== 0 ? triggerable : default_ !== undefined ? [default_] : undefined;
                if (trigger !== undefined && this.isIn(inclusive_gateway_id)) {
                    inclusive_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => {
                        if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === inclusive_gateway.id);
                        if (trigger.find(sequence_flow_ => sequence_flow_ === sequence_flow)) {
                            this.gen(sequence_flow.id); // e.g., 'c1', 'c2'
                            BPMiNer.Trigger(sequence_flow);
                        } else
                            BPMiNer.Kill(sequence_flow);
                    });
                }
            });
            inclusive_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => { // e.g., 'c1', 'c2'
                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === inclusive_gateway.id);
                /**
                 * Assign (specific) animation behavior for direct outgoing seq. flows.
                 * Note that BPMN "default" seq. flows *DO NOT* react to 'click'.
                 */
                if (default_ === undefined || (default_ !== undefined && sequence_flow.id !== default_.id))
                    BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener('click', (me: MouseEvent) => {
                        me.stopPropagation();
                        if (this.isIn(inclusive_gateway_id))
                            BPMiNer.Pre_trigger(sequence_flow);
                    });
                const execution_stack: Array<SCION.State> = this._create_region_in_parallel(inclusive_gateway, inclusive_gateway_as_state as SCION.Fork, ...states);
                // Recursive call:
                const status_ = this._compute_state(sequence_flow, ...execution_stack);
                if (status_.validation.has(Validation.Loopback))
                    inclusive_gateway_as_state.transitions!.push({
                        event: sequence_flow.id,
                        // When reentering activity, make non-interruptible boundary events again active:
                        onTransition: () => setTimeout(() => this._executor.gen(Validation.Loopback)),
                        target: sequence_flow.targetRef!.id
                    });
                else
                    this._no_join(sequence_flow, states[states.length - 1]);
            });
        } else if (status.type === Gateway_type.BPMN_ComplexGatewayJOIN || status.type === Gateway_type.BPMN_InclusiveGatewayJOIN) {
            BPMiNer.Compute_execution_path_JOIN(execution_flow, status, states);
            const superstate = this._join(inclusive_gateway, execution_flow, states);
            if (BPMiNer.Get_state(inclusive_gateway, ...states)) // JOIN inclusive gateway has already been processed?
                return status;
            const inclusive_gateway_as_state = this._compute_flow_object_as_state(inclusive_gateway, status, superstate);
            inclusive_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => {
                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === inclusive_gateway.id);
                /**
                 * Assign (basic) animation behavior for seq. flow.
                 */
                if (!status.validation.has(Validation.Reentrance))
                    BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener('click', () => this._executor.gen(sequence_flow.id));
                inclusive_gateway_as_state!.transitions!.push({
                    event: sequence_flow.id,
                    onTransition: this._onTransition.bind(this, sequence_flow),
                    target: BPMiNer.Pseudo_reenter(sequence_flow)
                });
                // Recursive call:
                const status_ = this._compute_state(sequence_flow, ...states);
            });
        }
        return status;
    }

    /* Inspiration: 'TEST_CASES/Parallel_gateway.ts' */
    private _compute_parallel_gateway_execution(execution_flow: Sequence_flow, ...states: SCION.State[]): Gateway_status | never {
        const parallel_gateway: Gateway = execution_flow.targetRef! as Gateway;
        if (BPMiNer.Trace) console.assert(parallel_gateway.$type === Gateway_type.BPMN_ParallelGateway);
        let parallel_gateway_id = parallel_gateway.id;
        const status: Gateway_status = BPMiNer_process._Validate_gateway(parallel_gateway);
        if (status.validation.has(Validation.Gateway_Unknown) || status.validation.has(Validation.Gateway_neither_FORK_nor_JOIN))
            throw new BPMN_error(parallel_gateway, ...Array.from(status.validation));
        if (status.type === Gateway_type.BPMN_ParallelGatewayFORK) {
            BPMiNer.Compute_execution_path(execution_flow, execution_flow.targetRef!, status);
            if (status.validation.has(Validation.Loopback)) {
                if (BPMiNer.Trace) console.warn(BPMiNer.Get_name_when_possible(parallel_gateway) + ": status.validation.has(Validation.Loopback)");
                return status;
            }
            const parallel_gateway_as_state: SCION.State = this._compute_flow_object_as_state(parallel_gateway, status, states[states.length - 1]);
            /**
             * One *CANNOT* click on a parallel FORK gateway.
             * However, *ALL* outgoing seq. flows have to look like "FLOW_TRIGGERED" at entering time.
             */
            const onEntry: () => void = parallel_gateway_as_state.onEntry!; // 'onEntry' has been set in '_compute_flow_object_as_state'...
            parallel_gateway_as_state.onEntry = () => {
                onEntry();
                parallel_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => BPMiNer.Trigger_force(sequence_flow));
            };
            parallel_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => {
                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === parallel_gateway.id);
                /**
                 * No (specific) animation behavior for outgoing seq. flows.
                 */
                const execution_stack: Array<SCION.State> = this._create_region_in_parallel(parallel_gateway, parallel_gateway_as_state as SCION.Fork, ...states);
                // Recursive call:
                const status_ = this._compute_state(sequence_flow, ...execution_stack);
                if (status_.validation.has(Validation.Loopback)) {
                    BPMiNer.Warn(parallel_gateway, Validation.Gateway_recursive_parallelism);
                    parallel_gateway_as_state.transitions!.push({
                        event: sequence_flow.id,
                        // When reentering activity, make non-interruptible boundary events again active:
                        onTransition: () => setTimeout(() => this._executor.gen(Validation.Loopback)),
                        target: sequence_flow.targetRef!.id
                    });
                } else
                    this._no_join(sequence_flow, states[states.length - 1]);
            });
        } else if (status.type === Gateway_type.BPMN_ParallelGatewayJOIN) {
            BPMiNer.Compute_execution_path_JOIN(execution_flow, status, states);
            const superstate = this._join_parallel(parallel_gateway, execution_flow, states);
            if (BPMiNer.Get_state(parallel_gateway, ...states)) // JOIN parallel gateway has already been processed?
                return status;
            const parallel_gateway_as_state: SCION.State = this._compute_flow_object_as_state(parallel_gateway, status, superstate);
            parallel_gateway.outgoing!.forEach((sequence_flow: Sequence_flow) => {
                if (BPMiNer.Trace) console.assert(sequence_flow.$type === Flow_type.BPMN_SequenceFlow && sequence_flow.sourceRef!.id === parallel_gateway.id);
                /**
                 * Assign (basic) animation behavior to seq. flow.
                 */
                if (!status.validation.has(Validation.Reentrance))
                    BPMiNer.Get_SVGGElement(sequence_flow.id).addEventListener('click', () => this._executor.gen(sequence_flow.id));
                parallel_gateway_as_state.transitions!.push({
                    event: sequence_flow.id,
                    onTransition: this._onTransition.bind(this, sequence_flow),
                    target: BPMiNer.Pseudo_reenter(sequence_flow)
                });
                // Recursive call:
                const status_ = this._compute_state(sequence_flow, ...states);
            });
        }
        return status;
    }

    private _compute_state(me: ModdleElement, ...states: SCION.State[]): Activity_status | Event_status | Gateway_status | never {
        /**
         * By construction, 'states[states.length - 1]' is superstate...
         */
        const is_start_activity_ = BPMiNer.Is_start_activity_(me);
        const type = me.$type === Event_type.BPMN_StartEvent || is_start_activity_ ? me.$type : me.targetRef!.$type;
        switch (type) {
            case Event_type.BPMN_EndEvent:
                return this._compute_end_event_execution(me, ...states);
                break;
            case Event_type.BPMN_IntermediateCatchEvent:
            case Event_type.BPMN_IntermediateThrowEvent:
                return this._compute_intermediate_event_execution(me, ...states);
                break;
            case Event_type.BPMN_StartEvent:
                // This is not a seq. flow, but its target:
                return this._compute_start_event_execution(me, ...states);
                break;
            case Gateway_type.BPMN_EventBasedGateway: // "Exclusive" versus "Parallel"?
                return this._compute_event_based_gateway_execution(me as Event_based_gateway, ...states);
                break;
            case Gateway_type.BPMN_ExclusiveGateway:
                return this._compute_exclusive_gateway_execution(me, ...states);
                break;
            // Complex gateways behave somehow like inclusive gateways (OMG BPMN spec., ver. 2.0.2, p. 294):
            case Gateway_type.BPMN_ComplexGateway:
            case Gateway_type.BPMN_InclusiveGateway:
                return this._compute_inclusive_gateway_execution(me, ...states);
                break;
            case Gateway_type.BPMN_ParallelGateway:
                return this._compute_parallel_gateway_execution(me, ...states);
                break;
            case Activity_type.BPMN_BusinessRuleTask:
            case Activity_type.BPMN_CallActivity:
            case Activity_type.BPMN_ManualTask:
            case Activity_type.BPMN_ReceiveTask:
            case Activity_type.BPMN_ScriptTask:
            case Activity_type.BPMN_SendTask:
            case Activity_type.BPMN_ServiceTask:
            case Activity_type.BPMN_Task:
            case Activity_type.BPMN_UserTask:
                return this._compute_activity_execution(me, ...states);
                break;
            case Activity_type.BPMN_SubProcess:
            case Activity_type.BPMN_Transaction:
                const id = is_start_activity_ ? me.id : me.targetRef!.id;
                const embedded_subprocess = is_start_activity_ ? me : me.targetRef;
                if (this._embedded_subprocesses.get(id) === undefined)
                    this._embedded_subprocesses.set(id, new BPMiNer_process(embedded_subprocess as Process, this._message_flows));
                return this._compute_activity_execution(me, ...states);
                break;
            default:
                throw new BPMN_error(me, BPMN_error.BPMN_element_type_is_not_supported, type);
        }
    }

    private _compute_state_machine(): never | SCION.State {
        if (BPMiNer.Trace) console.assert(this._process.hasOwnProperty('flowElements'), "'_compute_state_machine' >> 'this._process.hasOwnProperty('flowElements')', untrue.");
        const terminate_context: string = BPMiNer.Create_id_for_non_visual_state_machine_element(this._process.id);
        const process: SCION.State = {
            id: this._process.id,
            states: new Array,
            transitions: new Array({
                event: terminate_context, // 'TERMINATE' event...
                target: terminate_context  // Move to 'TERMINATE' state...
            })
        };
        // Catch 'TERMINATE' event:
        BPMiNer.Record_listener(terminate_context, (event) => {
            event.stopImmediatePropagation();
            setTimeout(() => {
                // Processes terminate their own embedded and event subprocesses; so, stop recursive termination:
                if (this.isIn(terminate_context)) return;
                // Move to 'TERMINATE' state:
                this.gen(terminate_context);
                // Terminate subprocesses:
                this._embedded_subprocesses.forEach((value: BPMiNer_process) => BPMiNer.Terminate_process(value._process));
                /* BPMN 2 spec., p. 440: "Only one interrupting Event Handler MAY be initiated for a given EventDefinition within the context of the parent Activity" */
                // Disable all *INTERRUPTING* (except current interrupting event subprocess) event subprocesses:
                this._event_subprocesses.forEach((value: BPMiNer_process, key: string) => {
                    if (!(BPMiNer.Is_interruptible_event_subprocess_(value._process)
                        && (event as CustomEvent<{ event_subprocess: Process }>).detail.event_subprocess !== undefined
                        && key === BPMiNer.Get_original_id((event as CustomEvent<{ event_subprocess: Process }>).detail.event_subprocess.id)))
                        BPMiNer.Terminate_process(value._process);
                });
                if (BPMiNer.Trace) console.warn(BPMiNer.Get_name_when_possible(this._process) + " TERMINATED");
            });
        });
        // Catch end event:
        BPMiNer.Record_listener(this._process.id, (event) => {
            event.stopImmediatePropagation();
            setTimeout(() => { // Queue evaluation in order to get 'isIn' equals to 'true' for the BPMN end event...
                const configuration = this.getFullConfiguration().filter(id => !BPMiNer.Is_non_visual_state_id_(id) && BPMiNer.Get_original_id(id) !== BPMiNer.Get_original_id(this._process.id))
                    .map(id => BPMiNer.Get_original_id(id));
                this._process.flowElements.filter(me => BPMiNer.Is_FORK_gateway_(me) && configuration.includes(BPMiNer.Get_original_id(me.id)))
                    .forEach(gateway => {
                        if (BPMiNer.Compute_transitive_closure(gateway).has((event as CustomEvent<{ event: Event }>).detail.event))
                            configuration.splice(configuration.indexOf(BPMiNer.Get_original_id(gateway.id)), 1);
                    });
                // The BPMN end event has been reached ('isIn' equals to 'true'):
                if (BPMiNer.Trace) console.assert(configuration.includes(BPMiNer.Get_original_id((event as CustomEvent<{ event: Event }>).detail.event.id)));
                const termination = configuration.every(id => this._process.flowElements.filter(me => me.$type === Event_type.BPMN_EndEvent)
                    .map(event => BPMiNer.Get_original_id(event.id)).includes(id));
                if (termination) {
                    BPMiNer.Terminate_process(this._process);
                    this._process.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                    // See 'Meal.bpmn' or 'Meal_.bpmn': tell enclosing process to move forward:
                    if (BPMiNer.Is_interruptible_event_subprocess_(this._process))
                        this._process.$parent.outgoing?.forEach((sequence_flow: Sequence_flow) => BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                }
                if (BPMiNer.Trace) console.warn(BPMiNer.Get_name_when_possible(this._process) + " ENDED with termination? " + termination + " from: " + BPMiNer.Get_name_when_possible((event as CustomEvent<{ event: Event }>).detail.event));
            });
        });
        const start_events: Array<Event> = this._process.flowElements.filter(me => me.$type === Event_type.BPMN_StartEvent);
        if (start_events.length === 0) {
            if (BPMiNer.Is_event_subprocess_(this._process))
                throw new BPMN_error(this._process, BPMN_error.Event_subprocess_must_have_one_and_only_one_start_event);
            const start_activities: Array<Activity> = this._process.flowElements.filter(me => BPMiNer.Is_start_activity_(me));
            if (start_activities.length !== 0)
                // Recursion starts from here:
                start_activities.forEach(activity => this._compute_state(activity, process));
            else
                BPMiNer.Warn(this._process, Validation.No_start_point);
        } else {
            this._process.flowElements.filter(me => BPMiNer.Is_event_subprocess_(me))
                .forEach(event_subprocess => this._event_subprocesses.set(event_subprocess.id, new BPMiNer_process(event_subprocess as Process, this._message_flows)));
            this._process.flowElements.filter(me => BPMiNer.Is_event_subprocess_(me) && BPMiNer.Is_interruptible_event_subprocess_(me as Process))
                .forEach(interruptible_event_subprocess => {
                    BPMiNer.Record_listener(interruptible_event_subprocess.id, (event) => {
                        this._process.outgoing?.forEach(sequence_flow => // Non-satisfactory, this may only be partial end of event subprocess:
                            BPMiNer.Get_SVGGElement(sequence_flow.id).dispatchEvent(new Event('dblclick')));
                    });
                });
            if (start_events.length > 1) {
                if (BPMiNer.Is_event_subprocess_(this._process))
                    throw new BPMN_error(this._process, BPMN_error.Event_subprocess_must_have_one_and_only_one_start_event);
                // More than one start event requires these events to be in parallel:
                const fork: SCION.Fork = {
                    states: new Array,
                    $type: BPMiNer.Parallel
                };
                process.states!.push(fork);
                start_events.forEach(event => {
                    const execution_stack: Array<SCION.State> = this._create_region_in_parallel('JOINABLE', fork, process);
                    // Recursion starts from here:
                    this._compute_state(event, ...execution_stack);
                });
            } else
                // Recursion starts from here:
                start_events.forEach(event => this._compute_state(event, process));
        }
        process.states!.push({ // 'TERMINATE' state...
            onEntry: () => {
                // Compensation activities *ARE NOT* backed up by states; activities are then turned off when terminating parent processes:
                this._process.flowElements.filter(me => Object.values(Activity_type).includes(me.$type as Activity_type))
                    .forEach(activity => BPMiNer.Get_boundary_events(activity)
                        .forEach(event => BPMiNer.Get_compensations(event)
                            .forEach(association => BPMiNer.Untrigger_compensation(association))));
                if (BPMiNer.Trace) console.info("\tEntering " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(this._process.id))));
            },
            onExit: () => {
                if (BPMiNer.Trace) console.info("\tExiting " + BPMiNer.Create_id_for_non_visual_state_machine_element(BPMiNer.Get_name_when_possible(this._get_model_element(this._process.id))));
            },
            id: terminate_context
        });
        return process;
    }
}

// (function (): void { // Visualize API of 'BPMiNer.Viewer'
//     const functions = [];
//     for (const f in BPMiNer.Viewer)
//         if (typeof BPMiNer.Viewer[f] === "function" /*&& BPMiNer.Viewer.hasOwnProperty(f)*/) // Inherited functions (with comment) as well...
//             functions.push(f);
//     alert("BPMiNer.Viewer API: " + functions.join(" - "));
// })();

class BPMN_error extends Error {
    public static readonly BPMN_element_type_is_not_supported: string = "BPMN element type is not supported";
    public static readonly Event_subprocess_must_have_one_and_only_one_start_event: string = "Event subprocess must have one and only one start event";
    public static readonly No_detected_execution_context: string = "No detected execution context";
    public static readonly No_detected_region_in_parallel: string = "No detected region in parallel";
    public static readonly No_detected_state: string = "No detected state";
    public static readonly No_detected_transition: string = "No detected transition";
    public static readonly No_new_detected_execution_path: string = "No new detected execution path";
    public static readonly Start_event_in_event_subprocess_only: string = "Start event in event subprocess only";

    public constructor(private readonly _flow_object: Flow_object, ...messages: Array<string>) {
        super(messages.join(' - '))
    }

    public get location(): ModdleElement {
        return this._flow_object;
    }
}
