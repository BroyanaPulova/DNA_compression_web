<template>
  <v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel v-for="(item,i) in sequences" :key="i">
        <v-expansion-panel-header>
          Sequence ID {{item.name}}
          <v-spacer></v-spacer>
          Current Size: {{bytesToSize(item.seq)}}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-textarea
            auto-grow
            dense
            full-width
            readonly
            filled
            name="input-7-4"
            label="Filled textarea"
            :value="item.seq"
          ></v-textarea>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-flex>
</template>

<script>
import { EventBus } from "../main.js";

export default {
  data: () => ({
    panel: [0, 1, 2],
    sequences: []
  }),
  methods: {
    bytesToSize: function(value) {
      let bytes = this.getByteLen(value);
      var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes == 0) return "0 Byte";
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return (
        Math.round((bytes / Math.pow(1024, i)) * 100, 2) / 100 + " " + sizes[i]
      );
    },
    /**
     * Count bytes in a string's UTF-8 representation.
     *
     * @param   string
     * @return  int
     */
    getByteLen: function(normal_val) {
      // Force string type
      normal_val = String(normal_val);

      var byteLen = 0;
      for (var i = 0; i < normal_val.length; i++) {
        var c = normal_val.charCodeAt(i);
        byteLen +=
          c < 1 << 7
            ? 1
            : c < 1 << 11
            ? 2
            : c < 1 << 16
            ? 3
            : c < 1 << 21
            ? 4
            : c < 1 << 26
            ? 5
            : c < 1 << 31
            ? 6
            : Number.NaN;
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
        this.sequences.push({ name: key, seq: value });
      }
    });
  }
};
</script>