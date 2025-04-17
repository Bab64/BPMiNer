const TEST_CASE_1 = require("scion-core");
const TEST_CASE_1_SM = new TEST_CASE_1.Statechart(
    {
        id: 'TEST_CASE_1',
        states: [
            {
                id: 'EXC1',
                $type: 'parallel',
                states: [ // 2 exits on 'EXC1'...
                    {
                        id: 'R1',
                        states: [
                            {
                                id: 'A@A',
                                transitions: [
                                    {
                                        event: 'c',
                                        target: 'A'
                                    }
                                ]
                            },
                            {
                                id: 'A',
                                transitions: [
                                    {
                                        event: 'd',
                                        target: 'EXC2'
                                    }
                                ]
                            },
                            {
                                id: 'EXC2',
                                $type: 'parallel',
                                states: [ // 2 exits on 'EXC2'...
                                    {
                                        id: 'R1a',
                                        states: [
                                            {
                                                id: 'END1@END1',
                                                transitions: [
                                                    {
                                                        event: 'e',
                                                        target: 'END1'
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'END1'
                                            }
                                        ]
                                    },
                                    {
                                        id: 'R1b',
                                        states: [
                                            {
                                                id: 'EXC2@EXC3@EXC2@EXC3',
                                                transitions: [
                                                    {
                                                        event: 'f',
                                                        target: 'EXC2@EXC3'
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'EXC2@EXC3',
                                                onEntry: () => {
                                                    setTimeout(() => {
                                                        TEST_CASE_1_SM.gen('f');
                                                        console.log("\t\tonEntry '^f': " + TEST_CASE_1_SM.getConfiguration());
                                                    });
                                                },
                                                transitions: [
                                                    {
                                                        cond: (): boolean => TEST_CASE_1_SM.isIn('END1@END1'),
                                                        event: 'f',
                                                        target: 'EXC3'
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
                                id: 'EXC1@EXC3@EXC1@EXC3',
                                transitions: [
                                    {
                                        event: 'b',
                                        target: 'EXC1@EXC3'
                                    }
                                ]
                            },
                            {
                                id: 'EXC1@EXC3',
                                onEntry: () => {
                                    setTimeout(() => {
                                        TEST_CASE_1_SM.gen('b');
                                        console.log("\t\tonEntry '^b': " + TEST_CASE_1_SM.getConfiguration());
                                    });
                                },
                                transitions: [
                                    {
                                        cond: (): boolean => TEST_CASE_1_SM.isIn('A@A'),
                                        event: 'b',
                                        target: 'EXC3'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'EXC3'
            }
        ]
    }
);

TEST_CASE_1_SM.start();
console.log('Initial: ' + TEST_CASE_1_SM.getConfiguration()); // 'EXC1@EXC3@EXC1@EXC3,A@A'
// TEST_CASE_1_SM.gen('b');
// console.log("'b' sent: " + TEST_CASE_1_SM.getConfiguration()); // 'EXC3'
TEST_CASE_1_SM.gen('c');
console.log("'c' sent: " + TEST_CASE_1_SM.getConfiguration()); // 'EXC1@EXC3@EXC1@EXC3,A'
TEST_CASE_1_SM.gen('b'); // No possibility of joining...
console.log("'b' sent: " + TEST_CASE_1_SM.getConfiguration());
TEST_CASE_1_SM.gen('d');
console.log("'d' sent: " + TEST_CASE_1_SM.getConfiguration()); // 'EXC1@EXC3,EXC2@EXC3@EXC2@EXC3,END1@END1'
TEST_CASE_1_SM.gen('b'); // No possibility of joining...
console.log("'b' sent: " + TEST_CASE_1_SM.getConfiguration());
TEST_CASE_1_SM.gen('f'); // 'EXC3'
console.log("'f' sent: " + TEST_CASE_1_SM.getConfiguration()); // 'EXC3'




