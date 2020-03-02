import Vue from 'vue'
import App from './App.vue'
import "vuetify/dist/vuetify.min.css";
import vuetify from './plugins/vuetify';
import AsyncComputed from 'vue-async-computed'

Vue.use(AsyncComputed)
Vue.config.productionTip = true
export const EventBus = new Vue();

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
