import { uuid } from "@primeuix/utils";
import { s as script$2 } from "./index-BDpKneMc.js";
import { style } from "@primeuix/styles/checkboxgroup";
import { B as BaseStyle } from "../server.mjs";
import { openBlock, createElementBlock, mergeProps, renderSlot } from "vue";
import "./index-DI7ROuCk.js";
import "@primeuix/styled";
import "@primeuix/utils/dom";
import "@primeuix/utils/object";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/hookable/dist/index.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/unctx/dist/index.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/ufo/dist/index.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/klona/dist/index.mjs";
import "@primeuix/utils/eventbus";
import "@primeuix/styles/base";
import "@tanstack/vue-query";
import "vue/server-renderer";
var classes = {
  root: "p-checkbox-group p-component"
};
var CheckboxGroupStyle = BaseStyle.extend({
  name: "checkboxgroup",
  style,
  classes
});
var script$1 = {
  name: "BaseCheckboxGroup",
  "extends": script$2,
  style: CheckboxGroupStyle,
  provide: function provide() {
    return {
      $pcCheckboxGroup: this,
      $parentInstance: this
    };
  }
};
var script = {
  name: "CheckboxGroup",
  "extends": script$1,
  inheritAttrs: false,
  data: function data() {
    return {
      groupName: this.name
    };
  },
  watch: {
    name: function name(newValue) {
      this.groupName = newValue || uuid("checkbox-group-");
    }
  },
  mounted: function mounted() {
    this.groupName = this.groupName || uuid("checkbox-group-");
  }
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", mergeProps({
    "class": _ctx.cx("root")
  }, _ctx.ptmi("root")), [renderSlot(_ctx.$slots, "default")], 16);
}
script.render = render;
export {
  script as default
};
//# sourceMappingURL=index-CmvXEQYq.js.map
