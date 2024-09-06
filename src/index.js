import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount((div => {
  document.querySelector("#new_comment_field,#discussion_body,#issue_body").parentElement.appendChild(div);
  return div;
})(document.createElement("div")))