import { s as script$2 } from "./index-DI7ROuCk.js";
import { style } from "@primeuix/styles/progressspinner";
import { B as BaseStyle } from "../server.mjs";
import { openBlock, createElementBlock, mergeProps, createElementVNode } from "vue";
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
import "@primeuix/utils";
import "@primeuix/styles/base";
import "@tanstack/vue-query";
import "vue/server-renderer";
var classes = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
};
var ProgressSpinnerStyle = BaseStyle.extend({
  name: "progressspinner",
  style,
  classes
});
var script$1 = {
  name: "BaseProgressSpinner",
  "extends": script$2,
  props: {
    strokeWidth: {
      type: String,
      "default": "2"
    },
    fill: {
      type: String,
      "default": "none"
    },
    animationDuration: {
      type: String,
      "default": "2s"
    }
  },
  style: ProgressSpinnerStyle,
  provide: function provide() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
};
var script = {
  name: "ProgressSpinner",
  "extends": script$1,
  inheritAttrs: false,
  computed: {
    svgStyle: function svgStyle() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
};
var _hoisted_1 = ["fill", "stroke-width"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", mergeProps({
    "class": _ctx.cx("root"),
    role: "progressbar"
  }, _ctx.ptmi("root")), [(openBlock(), createElementBlock("svg", mergeProps({
    "class": _ctx.cx("spin"),
    viewBox: "25 25 50 50",
    style: $options.svgStyle
  }, _ctx.ptm("spin")), [createElementVNode("circle", mergeProps({
    "class": _ctx.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: _ctx.fill,
    "stroke-width": _ctx.strokeWidth,
    strokeMiterlimit: "10"
  }, _ctx.ptm("circle")), null, 16, _hoisted_1)], 16))], 16);
}
script.render = render;
export {
  script as default
};
//# sourceMappingURL=index-BE9yeyjp.js.map
