const TEST_CASE_3 = require("scion-core");
const TEST_CASE_3_SM = new TEST_CASE_3.Statechart(
    {
        id: 'TEST_CASE_3',
        states: [
            {
                id: 'FORK PAR.1',
                $type: 'parallel',
                states: [

                    {
                        id: 'R1',
                        states: [
                            {
                                id: 'A',
                                transitions: [
                                    {
                                        event: 'b',
                                        target: 'FORK PAR.2'
                                    }
                                ]
                            },
                            {
                                id: 'FORK PAR.2',
                                $type: 'parallel',
                                states: [
                                    {
                                        id: 'R1b',
                                        states: [
                                            {
                                                id: 'End1'
                                            }
                                        ]
                                    },
                                    {
                                        id: 'R1a',
                                        states: [
                                            {
                                                id: 'FORK PAR.2@JOIN PAR.',
                                                onEntry: () => {
                                                    setTimeout(() => {
                                                        TEST_CASE_3_SM.gen('completion');
                                                        console.log("\t\t^completion: " + TEST_CASE_3_SM.getConfiguration());
                                                    });
                                                },
                                                transitions: [
                                                    {
                                                        cond: (): boolean => {
                                                            return TEST_CASE_3_SM.isIn('FORK PAR.1@JOIN PAR.');
                                                        },
                                                        event: 'completion',
                                                        target: 'JOIN PAR.'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'R2',
                        states: [
                            {
                                id: 'FORK PAR.1@JOIN PAR.',
                                onEntry: () => {
                                    setTimeout(() => {
                                        TEST_CASE_3_SM.gen('completion');
                                        console.log("\t\t^completion: " + TEST_CASE_3_SM.getConfiguration());
                                    });
                                },
                                transitions: [
                                    {
                                        cond: (): boolean => {
                                            return TEST_CASE_3_SM.isIn('FORK PAR.2@JOIN PAR.');
                                        },
                                        event: 'completion',
                                        target: 'JOIN PAR.'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'JOIN PAR.'
            }
        ]
    }
);

TEST_CASE_3_SM.start();
console.log('Initial: ' + TEST_CASE_3_SM.getConfiguration()); // 'FORK PAR.@JOIN PAR.,A'
TEST_CASE_3_SM.gen('b');
console.log("'b' sent: " + TEST_CASE_3_SM.getConfiguration());
// TEST_CASE_3_SM.gen('c');
// console.log("'c' sent: " + TEST_CASE_3_SM.getConfiguration());
// TEST_CASE_3_SM.gen('d');
// console.log("'d' sent: " + TEST_CASE_3_SM.getConfiguration());
