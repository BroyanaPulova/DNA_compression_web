<template>
<v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
    <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel v-for="(item,i) in sequences" :key="i">
            <v-expansion-panel-header>
                Sequence ID {{item.name}}
                <v-spacer></v-spacer>
                Raw Size: {{bytesToSize(item.seq)}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <v-tabs fixed-tabs background-color="indigo" v-model="tab" dark>
                    <v-tab>
                        Raw Sequence - Size {{bytesToSize(item.seq)}}
                    </v-tab>
                    <v-tab>
                        Huffman - Size {{sizeSeq(item.comp_seq_nor_huffman)}} <br> Time {{item.comp_seq_nor_huffman_time}} milis.
                    </v-tab>
                    <v-tab>
                        Shannon Fano - Size {{sizeSeq(item.comp_seq_normal_shano)}} <br> Time {{item.comp_seq_normal_shano_time}} milis.
                    </v-tab>
                    <v-tab>
                        Modified Huffman - Size {{sizeSeq(item.comp_seq_new_huffman)}} <br> Time {{item.comp_seq_new_huffman_time}} milis.
                    </v-tab>
                </v-tabs>

                <v-tabs-items v-model="tab">
                    <v-tab-item>
                        <v-card flat>
                            <v-card-text>
                                <v-textarea auto-grow dense full-width readonly filled name="input-7-4" label="Filled textarea" :value="item.seq"></v-textarea>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item>
                        <v-card flat>
                            <v-card-text>
                                <v-textarea auto-grow dense full-width readonly filled name="input-7-4" label="Filled textarea" :value="item.comp_seq_nor_huffman"></v-textarea>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item>
                        <v-card flat>
                            <v-card-text>
                                <v-textarea auto-grow dense full-width readonly filled name="input-7-4" label="Filled textarea" :value="item.comp_seq_normal_shano"></v-textarea>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item>
                        <v-card flat>
                            <v-card-text>
                                <v-textarea auto-grow dense full-width readonly filled name="input-7-4" label="Filled textarea" :value="item.comp_seq_new_huffman"></v-textarea>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</v-flex>
</template>

<script>
import axios from "axios";
import {
    EventBus
} from "../main.js";

const getCompressedSeqNormalHuffman = async (seq) => {
    var start = performance.now();
    let response = await axios.put('http://172.19.0.2/api/', {
        sequence: seq.seq
    }, {
        headers: {
            "content-type": "application/json"
        }
    });

    seq.comp_seq_nor_huffman = response.data.result;
    seq.comp_seq_nor_huffman_time = performance.now() - start;
}

const getCompressedSeqNormalShano = async (seq) => {
    var start = performance.now();
    let response = await axios.post('http://172.19.0.2/shano/', {
        sequence: seq.seq
    }, {
        headers: {
            "content-type": "application/json"
        }
    });

    seq.comp_seq_normal_shano = response.data.result;
    seq.comp_seq_normal_shano_time = performance.now() - start;
}

const getCompressedSeqNewHuffman = async (seq) => {
    var start = performance.now();
    let response = await axios.post('http://172.19.0.2/api/', {
        sequence: seq.seq
    }, {
        headers: {
            "content-type": "application/json"
        }
    });

    seq.comp_seq_new_huffman = response.data.result;
    seq.comp_seq_new_huffman_time = performance.now() - start;
}

export default {
    data: () => ({
        panel: [0, 1, 2],
        sequences: [],
        compresedSequences: [],
        tab: null
    }),
    methods: {
        baseBytesTosize: function (bytes) {
            var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
            if (bytes == 0) return "0 Byte";
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return (
                Math.round((bytes / Math.pow(1024, i)) * 100, 2) / 100 + " " + sizes[i]
            );
        },
        bytesToSize: function (value) {
            let bytes = this.getByteLen(value);
            return this.baseBytesTosize(bytes);
        },
        sizeSeq: function (value) {
            if (value) {
                //return this.baseBytesTosize(value.length / 8);
                return value.length/8;
            } else {
                return 0;
            }
        },
        /**
         * Count bytes in a string's UTF-8 representation.
         *
         * @param   string
         * @return  int
         */
        getByteLen: function (normal_val) {
            // Force string type
            normal_val = String(normal_val);

            var byteLen = 0;
            for (var i = 0; i < normal_val.length; i++) {
                var c = normal_val.charCodeAt(i);
                byteLen +=
                    c < 1 << 7 ?
                    1 :
                    c < 1 << 11 ?
                    2 :
                    c < 1 << 16 ?
                    3 :
                    c < 1 << 21 ?
                    4 :
                    c < 1 << 26 ?
                    5 :
                    c < 1 << 31 ?
                    6 :
                    Number.NaN;
            }
            return byteLen;
        }
    },
    mounted() {
        EventBus.$on("read_sequence", sequence => {
            this.panel = [];
            this.sequences = [];
            for (var key in sequence) {
                var value = sequence[key];
                var sequence_obj = {
                    name: key,
                    seq: value,
                    comp_seq_nor_huffman: '',
                    comp_seq_normal_shano: '',
                    comp_seq_new_huffman: '',
                    comp_seq_nor_huffman_time: 0,
                    comp_seq_normal_shano_time: 0,
                    comp_seq_new_huffman_time: 0
                };
                getCompressedSeqNewHuffman(sequence_obj);
                getCompressedSeqNormalHuffman(sequence_obj);
                getCompressedSeqNormalShano(sequence_obj);
                this.sequences.push(sequence_obj);
            }

        });
    }
};
</script>
