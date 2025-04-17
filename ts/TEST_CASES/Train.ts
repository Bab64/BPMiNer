const TRAIN = require("scion-core");
const TRAIN_state_machine = new TRAIN.Statechart(
    {
        id: 'TRAIN',
        states: [
            {
                id: 'Go_by_train_to_city_C@Loopback',
                transitions: [
                    {
                        event: 'loopback',
                        target: 'Go_by_train_to_city_C@Loopback'
                    }
                ],
                $type: 'parallel',
                states: [
                    {
                        id: 'RIP_Go_by_train_to_city_C',
                        states: [
                            {
                                id: 'Go_by_train_to_city_C',
                                transitions: [
                                    {
                                        /**
                                         * 'cond': le chemin d'exécution potentiel parallèle induit par l'événement
                                         * non-interruptible (frontière) 'Delay' *N'A PAS* été activé...
                                         */
                                        cond: (): boolean => TRAIN_state_machine.isIn('Reschedule_bus_at_C@Reschedule_bus_at_C')
                                            // All non-interruptible (boundary) events still active:
                                            || TRAIN_state_machine.isIn('Delay'),
                                        event: 'Go_by_train_to_city_C_2_INCLUSIVE_GATEWAY',
                                        target: 'INCLUSIVE_GATEWAY'
                                    },
                                    {   // Attention, transition par défaut si la précédente est 'false' :
                                        event: 'Go_by_train_to_city_C_2_INCLUSIVE_GATEWAY',
                                        target: 'Go_by_train_to_city_C@Go_by_train_to_city_C'
                                    }
                                ]
                            },
                            {
                                id: 'Go_by_train_to_city_C@Go_by_train_to_city_C'
                            }
                        ]
                    },
                    {
                        id: 'RIP_JOINABLE',
                        states: [
                            {
                                id: 'Delay',
                                transitions: [
                                    {
                                        event: 'Delay_2_Reschedule_bus_at_C',
                                        target: 'Reschedule_bus_at_C'
                                    }
                                ]
                            },
                            {
                                id: 'Reschedule_bus_at_C',
                                transitions: [
                                    {
                                        cond: (): boolean => TRAIN_state_machine.isIn('Go_by_train_to_city_C@Go_by_train_to_city_C'),
                                        event: 'Reschedule_bus_at_C_2_INCLUSIVE_GATEWAY',
                                        target: 'INCLUSIVE_GATEWAY'
                                    },
                                    { // Attention, transition par défaut si la précédente est 'false' :
                                        event: 'Reschedule_bus_at_C_2_INCLUSIVE_GATEWAY',
                                        target: 'Reschedule_bus_at_C@Reschedule_bus_at_C'
                                    }
                                ]
                            },
                            {
                                id: 'Reschedule_bus_at_C@Reschedule_bus_at_C'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'INCLUSIVE_GATEWAY'
            }
        ]
    }
);

// console.info("\t\t*** Scenario #0");
// TRAIN_state_machine.start();
// TRAIN_state_machine.gen('Go_by_train_to_city_C_2_INCLUSIVE_GATEWAY');
// console.log("0. Scenario #0 (succès) -> " + TRAIN_state_machine.getConfiguration());

console.info("\t\t*** Scenario #1");
TRAIN_state_machine.start();
TRAIN_state_machine.gen('Delay_2_Reschedule_bus_at_C');
console.log("1. On a quitté 'Delay' -> " + TRAIN_state_machine.getConfiguration());
TRAIN_state_machine.gen('Go_by_train_to_city_C_2_INCLUSIVE_GATEWAY');
console.log("2. On veut quitter 'Go by train to city C' (échec) -> " + TRAIN_state_machine.getConfiguration());
TRAIN_state_machine.gen('Reschedule_bus_at_C_2_INCLUSIVE_GATEWAY');
console.log("3. On veut quitter 'Reschedule bus at C' (succès) -> " + TRAIN_state_machine.getConfiguration());

console.info("\t\t*** Scenario #2");
TRAIN_state_machine.start();
TRAIN_state_machine.gen('Delay_2_Reschedule_bus_at_C');
console.log("1. On a quitté 'Delay' -> " + TRAIN_state_machine.getConfiguration());
TRAIN_state_machine.gen('Reschedule_bus_at_C_2_INCLUSIVE_GATEWAY');
console.log("2. On veut quitter 'Reschedule bus at C' (échec) -> " + TRAIN_state_machine.getConfiguration());
TRAIN_state_machine.gen('Go_by_train_to_city_C_2_INCLUSIVE_GATEWAY');
console.log("3. On veut quitter 'Go by train to city C' (succès) -> " + TRAIN_state_machine.getConfiguration());






