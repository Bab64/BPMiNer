// import BpmnJS from "bpmn-js"; // "./ts/typings/bpmn-js.d.ts"

import BPMiNer from "./BPMiNer.js";

declare const BpmnJS: any;

namespace LiveBPMN {
    export let HTML_input_element: HTMLInputElement;
}

window.addEventListener('contextmenu', (me) => {
    me.preventDefault();
    LiveBPMN.HTML_input_element.click();
});

window.addEventListener('DOMContentLoaded', async () => {
    LiveBPMN.HTML_input_element = window.document.createElement('input');
    LiveBPMN.HTML_input_element.type = 'file';
    LiveBPMN.HTML_input_element.onchange = (event) => {
        if ((event.target as HTMLInputElement).files!.length > 0) {
            BPMiNer.Set_current_test_case({
                index: 14,
                name: (event.target as HTMLInputElement).files![0].name.substring(0, (event.target as HTMLInputElement).files![0].name.indexOf("."))
            });
            // Load XML:
            BPMiNer.File_reader.readAsText((event.target as HTMLInputElement).files![0]);
        }
    };

    BPMiNer.Drag_and_drop(); // Enable drag & drop...
    const liveBPMN = window.document.getElementById("LiveBPMN") as HTMLDivElement; // See "LiveBPMN" as id. in 'index.html'...
    BPMiNer.Viewer = new BpmnJS({container: liveBPMN});
    window.addEventListener('fit-viewport', () => BPMiNer.Viewer.get('canvas').zoom('fit-viewport'));

    window.document.body.addEventListener(BPMiNer.Reload, () => {
        new BPMiNer(window.history.state.XML, true).execute().catch(error => window.alert("LiveBPMN: " + error));
    });
    BPMiNer.Set_current_test_case({
        index: 0,
        name: "LiveBPMN",
        XML: await (new BPMiNer("./TEST_CASES/LiveBPMN.bpmn")).XML
    });
    window.document.body.dispatchEvent(new Event(BPMiNer.Reload));

    /** Implicit parallelism (not handled) */
    // (new BPMiNer('./TEST_CASES/Implicit_parallelism/Implicit_parallelism.bpmn')).execute(); // Bug: visual problem on sequence flow
    // (new BPMiNer('./TEST_CASES/Implicit_parallelism/Very-complex-diagram.bpmn')).execute();
    /** End of implicit parallelism */

    /** Subtle join */
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Car_Kogito.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Exclusive_join.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Inclusive_join.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Parallel_join_blah.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Parallel_join_DEADLOCK.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Train.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Train_.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_subtle/Train_Kogito.bpmn')).execute();
    /** End of subtle join */

    /** Boundary event */
    /* OK */ // (new BPMiNer('./TEST_CASES/Boundary_event/Boundary_events.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/Boundary_event/Boundary_events_.bpmn')).execute(); // "Reentrance", "Terminate event" as well...
    /* OK */ // new BPMiNer('./TEST_CASES/Boundary_event/Late_working.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Boundary_event/Laws.bpmn'); // "Event-based gateway" as well...
    /* OK */ // (new BPMiNer('./TEST_CASES/Boundary_event/OCEB_2_P_114.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/Boundary_event/OCEB_2_P_114_.bpmn')).execute();
    /** End of boundary event */

    /** Communication */
    /* OK */ // (new BPMiNer('./TEST_CASES/BCMS/BCMS_Req._1.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/BCMS/BCMS_Req._2.bpmn')).execute(); // "Event-based gateway" as well...
    /* OK */ // (new BPMiNer('./TEST_CASES/BCMS/BCMS_Req._3A.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/BCMS/BCMS_Req._3B.bpmn')).execute(); // "Event subprocess" as well...
    /* OK */ // new BPMiNer('./TEST_CASES/Communication/Message.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/Communication/Message_.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/Communication/Noel.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Communication/Signal.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Communication/ThrowCatch.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Communication/ThrowCatch_.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Communication/ThrowCatch__.bpmn');
    /** End of communication */

    /** Deadlock */
    /* OK */ // new BPMiNer('./TEST_CASES/Teletravail/Teletravail_DEADLOCK.bpmn'); // "Boundary event" as well...
    // /** End of deadlock */

    /** Event-based gateway */
    /* OK */ // new BPMiNer('./TEST_CASES/Event_based_gateway/Event_based_gateway.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/Event_based_gateway/Event_based_gateway_.bpmn')).execute();
    /** End of event-based gateway */

    /** Event subprocess */
    /* OK */ // new BPMiNer('./TEST_CASES/Event_subprocess/Event_subprocess.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Event_subprocess/Event_subprocess_.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Event_subprocess/Event_subprocess__.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Event_subprocess/Interruptible_event_subprocess.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/Event_subprocess/Meal.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/Event_subprocess/Meal_.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Event_subprocess/Non_interruptible_event_subprocess.bpmn');
    /** Event subprocess */

    /** Loopback */
    /* OK */ // (new BPMiNer('./TEST_CASES/Chemistry/Chemistry.bpmn')).execute(); // "Boundary event" as well...
    /* OK */ // (new BPMiNer('./TEST_CASES/Chemistry/Chemistry_.bpmn'); // "Boundary event" as well...
    /* OK */ // new BPMiNer('./TEST_CASES/Loopback/Evolve_test_software.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Loopback/Hungry_eat.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Loopback/Hungry_replete_EXC.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Loopback/Hungry_replete_INC.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Loopback/Peekaboo.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/Loopback/Loopback_versus_reentrance.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/Loopback/Loopback_versus_reentrance_.bpmn')).execute();
    /* Recursive parallelism */ // new BPMiNer('./TEST_CASES/Loopback/Sick.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/Loopback/Speed_dating.bpmn'); // "Event-based gateway" as well...
    /** End of loopback */

    /** NYC MOMA case study */
    /* OK */ // (new BPMiNer('./TEST_CASES/NYC_MOMA/NYC_MOMA_drop_off.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/NYC_MOMA/NYC_MOMA_drop_off_.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/NYC_MOMA/NYC_MOMA_pick_up.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/NYC_MOMA/NYC_MOMA_drop_off_pick_up.bpmn')).execute();
    /** End of NYC MOMA case study */

    /** Process ending */
    // (new BPMiNer('./TEST_CASES/Process_ending/Error.bpmn')).execute();
    // (new BPMiNer('./TEST_CASES/Process_ending/Error_.bpmn')).execute();
    // (new BPMiNer('./TEST_CASES/Process_ending/Multiple_ends_.bpmn')).execute();
    // (new BPMiNer('./TEST_CASES/Process_ending/Signal.bpmn')).execute();
    // (new BPMiNer('./TEST_CASES/Process_ending/Signal_.bpmn')).execute();
    // (new BPMiNer('./TEST_CASES/Process_ending/Signal__.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/Process_ending/Terminate.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/Process_ending/Terminate_.bpmn')).execute();
    /** End of process ending */

    /** Reentrance */
    /* OK */ // new BPMiNer('./TEST_CASES/Reentrance/Knock_knock_ring_ring.bpmn'); // "Event-based gateway" as well...
    /* OK */ // (new BPMiNer('./TEST_CASES/Reentrance/Reentrance.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/Teletravail/Teletravail.bpmn'); // "Boundary event" as well...
    /** End of reentrance */

    /** *No* 'JOIN' */
    /* OK */ // (new BPMiNer('./TEST_CASES/No_JOIN/Breakfast.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/No_JOIN/Breakfast_.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/No_JOIN/Breakfast__.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/No_JOIN/Exclusive_gateway_no_JOIN.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/No_JOIN/Exclusive_gateway_no_JOIN_.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/No_JOIN/Parallel_gateway_no_JOIN.bpmn');

    /** JOIN exclusive gateway */
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Event_based_gateway__.bpmn')).execute(); // "Event-based gateway" as well...
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Exclusive_gateway.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Exclusive_gateway_with_default.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Exclusive_gateway__.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Exclusive_gateway___.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Exclusive_inclusive_gateway.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Meeting.bpmn'); // JOIN exclusive gateway without corresponding FORK gateway
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Reentrance.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/Spend_night_time_XOR.bpmn')).execute(); // "Boundary event" as well...
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/TEST_CASE_1.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/TEST_CASE_1a.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_exclusive_gateway/TEST_CASE_1b.bpmn')).execute();

    /** JOIN inclusive gateway */
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/Complex_gateway.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/Inclusive_gateway.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/Inclusive_gateway_with_default.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/Inclusive_gateway_.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/Inclusive_gateway__.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/Inclusive_exclusive_gateway.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/Reentrance_.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/TEST_CASE_2.bpmn')).execute();
    /**
     * Le bogue vient du fait que l'événement 'END1' suite immédiatement la porte parallèle...
     * Comme la config. a peu d'intérêt en pratique, le bogue n'est pas traité pour l'instant :
     */
    /* BUG */ // (new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/TEST_CASE_2a.bpmn')).execute();
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_inclusive_gateway/TEST_CASE_2b.bpmn')).execute();

    /** JOIN parallel gateway */
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Event_based_gateway_Deadlock.bpmn'); // "Deadlock", "Event-based gateway" as well...
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Mom_and_dad.bpmn')).execute(); // JOIN parallel gateway without corresponding FORK gateway
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Parallel_gateway.bpmn');
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Parallel_gateway_.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Parallel_gateway__.bpmn')).execute();
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Parallel_inclusive_gateway.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Rendez_vous.bpmn')).execute(); // "Boundary event" as well...
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Rendez_vous_.bpmn'); // "Boundary event" as well...
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Rendez_vous__.bpmn'); // "Boundary event" as well...
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/Spend_night_time_Deadlock.bpmn')).execute(); // "Boundary event", "Deadlock" as well...
    /* OK */ // new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/TEST_CASE_3.bpmn');
    /* OK */ // (new BPMiNer('./TEST_CASES/JOIN_parallel_gateway/TEST_CASE_3a.bpmn')).execute();
    /** JOIN parallel gateway */

    /** Weird cases */
    /* OK */ // (new BPMiNer('./TEST_CASES/Weird/Weird.bpmn')).execute();
    /** End of weird cases */
});
