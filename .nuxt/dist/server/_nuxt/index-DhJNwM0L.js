import { $dt } from "@primeuix/styled";
import { setCSSProperty } from "@primeuix/utils/dom";
import { s as script$2 } from "./index-DI7ROuCk.js";
import { style } from "@primeuix/styles/imagecompare";
import { B as BaseStyle } from "../server.mjs";
import { openBlock, createElementBlock, mergeProps, renderSlot, createElementVNode } from "vue";
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
  root: "p-imagecompare",
  slider: "p-imagecompare-slider"
};
var ImageCompareStyle = BaseStyle.extend({
  name: "imagecompare",
  style,
  classes
});
var script$1 = {
  name: "BaseImageCompare",
  "extends": script$2,
  props: {
    tabindex: {
      type: Number,
      "default": 0
    },
    ariaLabelledby: {
      type: String,
      "default": null
    },
    ariaLabel: {
      type: String,
      "default": null
    }
  },
  style: ImageCompareStyle,
  provide: function provide() {
    return {
      $pcImageCompare: this,
      $parentInstance: this
    };
  }
};
var script = {
  name: "ImageCompare",
  "extends": script$1,
  methods: {
    onSlide: function onSlide(event) {
      var value = event.target.value;
      var image = event.target.previousElementSibling;
      setCSSProperty(image, $dt("imagecompare.scope.x").name, "".concat(value, "%"));
    }
  }
};
var _hoisted_1 = ["aria-labelledby", "aria-label"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", mergeProps({
    "class": _ctx.cx("root"),
    "aria-labelledby": _ctx.ariaLabelledby,
    "aria-label": _ctx.ariaLabel
  }, _ctx.ptmi("root")), [renderSlot(_ctx.$slots, "left"), renderSlot(_ctx.$slots, "right"), createElementVNode("input", mergeProps({
    type: "range",
    min: "0",
    max: "100",
    value: "50",
    onInput: _cache[0] || (_cache[0] = function() {
      return $options.onSlide && $options.onSlide.apply($options, arguments);
    }),
    "class": _ctx.cx("slider")
  }, _ctx.ptm("slider")), null, 16)], 16, _hoisted_1);
}
script.render = render;
export {
  script as default
};
//# sourceMappingURL=index-DhJNwM0L.js.map
