const PARALLEL = require("scion-core");
const parallel_gateway = new PARALLEL.Statechart(
    {
        id: 'TEST',
        states: [
            {
                id: 'Fork',
                onExit: () => {
                    console.log("\tExiting 'Fork'... ");
                },
                $type: 'parallel',
                states: [
                    {
                        states: [
                            {
                                id: 'T1',
                                transitions: [
                                    {
                                        cond: (event: any): boolean => {
                                            console.log("\tT1 -a-> T1@T1[" + (!parallel_gateway.isIn("T2@T2") || !parallel_gateway.isIn("T3@T3")) + "]");
                                            return !parallel_gateway.isIn("T2@T2") || !parallel_gateway.isIn("T3@T3");
                                        },
                                        event: 'a',
                                        target: 'T1@T1'
                                    },
                                    {
                                        // cond: (event: any): boolean => {
                                        //     console.log("\tT1 -a-> Join[" + (parallel_gateway.isIn("T2@T2") && parallel_gateway.isIn("T3@T3")) + "]");
                                        //     return parallel_gateway.isIn("T2@T2") && parallel_gateway.isIn("T3@T3");
                                        // },
                                        event: 'a',
                                        target: 'Join'
                                    }
                                ]
                            },
                            {
                                id: 'T1@T1'
                            }
                        ]
                    },
                    {
                        states: [
                            {
                                id: "T2",
                                transitions: [
                                    {
                                        cond: (event: any): boolean => {
                                            console.log("\tT2 -b-> T2@T2[" + (!parallel_gateway.isIn("T1@T1") || !parallel_gateway.isIn("T3@T3")) + "]");
                                            return !parallel_gateway.isIn("T1@T1") || !parallel_gateway.isIn("T3@T3");
                                        },
                                        event: 'b',
                                        target: 'T2@T2'
                                    },
                                    {
                                        // cond: (event: any): boolean => {
                                        //     console.log("\tT2 -b-> Join[" + (parallel_gateway.isIn("T1@T1") && parallel_gateway.isIn("T3@T3")) + "]");
                                        //     return parallel_gateway.isIn("T1@T1") && parallel_gateway.isIn("T3@T3");
                                        // },
                                        event: 'b',
                                        target: 'Join'
                                    }
                                ]
                            },
                            {
                                id: 'T2@T2'
                            }
                        ]
                    },
                    {
                        states: [
                            {
                                id: "T3",
                                transitions: [
                                    {
                                        cond: (event: any): boolean => {
                                            console.log("\tT3 -c-> T3@T3[" + (!parallel_gateway.isIn("T1@T1") || !parallel_gateway.isIn("T2@T2")) + "]");
                                            return !parallel_gateway.isIn("T1@T1") || !parallel_gateway.isIn("T2@T2");
                                        },
                                        event: 'c',
                                        target: 'T3@T3'
                                    },
                                    {
                                        // cond: (event: any): boolean => {
                                        //     console.log("\tT3 -c-> Join[" + (parallel_gateway.isIn("T1@T1") && parallel_gateway.isIn("T2@T2")) + "]");
                                        //     return parallel_gateway.isIn("T1@T1") && parallel_gateway.isIn("T2@T2");
                                        // },
                                        event: 'c',
                                        target: 'Join'
                                    }
                                ]
                            },
                            {
                                id: 'T3@T3'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'Join',
                onEntry: () => {
                    console.log("\tEntering 'Join'...");
                }
            }
        ]
    }
);

parallel_gateway.start();
console.log('Initial: ' + parallel_gateway.getConfiguration()); // "T3,T2,T1"

parallel_gateway.gen('a');
console.log("'a' sent: " + parallel_gateway.getConfiguration()); // "T3,T2,T1@T1"
parallel_gateway.gen('c');
console.log("'c' sent: " + parallel_gateway.getConfiguration()); // "T2,T1@T1,T3@T3"
parallel_gateway.gen('b');
console.log("'b' sent: " + parallel_gateway.getConfiguration()); // "Join"


