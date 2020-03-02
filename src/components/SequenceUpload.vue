<template>
  <v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-file-input
          v-model="files"
          color="deep-purple accent-4"
          counter
          label="File input"
          multiple
          placeholder="Select Sequence File"
          prepend-icon="mdi-paperclip"
          outlined
          @change="onFilePicked"
        >
          <template v-slot:selection="{ index, text }">
            <v-chip v-if="index < 2" color="deep-purple accent-4" dark label small>{{ text }}</v-chip>

            <span
              v-else-if="index === 2"
              class="overline grey--text text--darken-3 mx-2"
            >+{{ files.length - 2 }} File(s)</span>
          </template>
        </v-file-input>
      </v-row>
      <v-row justify="space-around">
        <v-btn
          :disabled="isDisabled"
          x-large
          color="success"
          @click.native="processSelectedFiles()"
        >Parse {{files.length}} files</v-btn>
      </v-row>
    </v-container>
  </v-flex>
</template>

<script>
import { EventBus } from "../main.js";

export default {
  data: () => ({
    files: [],
    imageName: "",
    imageUrl: [],
    imageFile: {}
  }),
  computed: {
    isDisabled() {
      // evaluate whatever you need to determine disabled here...
      return this.files.length == 0;
    }
  },
  methods: {
    processSelectedFiles() {
      this.files.forEach(file => {
        const fr = new FileReader();

        fr.addEventListener("load", () => {
          let lines = fr.result.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
          let lastId = "";
          let i;
          let line = "";
          for (i = 0; i < lines.length; i++) {
            line = lines[i];
            if (line.startsWith(">")) {
              lastId = line.substring(1);
              this.imageFile[lastId] = "";
            } else {
              this.imageFile[lastId] = this.imageFile[lastId] + line;
            }
          }
        });
        fr.readAsText(file);

        EventBus.$emit("read_sequence", this.imageFile);
      });
    },
    onFilePicked() {}
  }
};
</script>