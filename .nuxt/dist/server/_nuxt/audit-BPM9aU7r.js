import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import script from "./index-C22-1zmx.js";
import script$2 from "./index-ZhqI6K-b.js";
import script$3 from "./index-CjJTah8j.js";
import script$1 from "./index-CJVC4OhG.js";
import script$4 from "./index-DDC9KImH.js";
import { u as useAcceptanceStore, a as useToast } from "../server.mjs";
import "@primeuix/utils";
import "@primeuix/utils/object";
import "./index-RZE_erJD.js";
import "./index-DxKIPVaB.js";
import "./index-DI7ROuCk.js";
import "@primeuix/styled";
import "@primeuix/utils/dom";
import "./index-CMFNMW0K.js";
import "@primeuix/styles/badge";
import "./index-DmGtcQDa.js";
import "./index-Dl3T3yr5.js";
import "@primeuix/utils/uuid";
import "@primeuix/styles/ripple";
import "@primeuix/styles/button";
import "./index-1v7fOn3J.js";
import "./index-BpKY0D2J.js";
import "@primeuix/styles/paginator";
import "./index-qhzJtE_o.js";
import "./index-TSK8ySp0.js";
import "@primeuix/utils/zindex";
import "./index-BH9iduCK.js";
import "./index-CP_fvbAb.js";
import "./index-CobSNMix.js";
import "./index-CLrwot36.js";
import "./index-BJFn3Jal.js";
import "./index-B_yMes1y.js";
import "@primeuix/styles/iconfield";
import "./index-DEIL5kug.js";
import "./index-rAVNvoJo.js";
import "@primeuix/utils/eventbus";
import "./index-zZrFrjQS.js";
import "./index-BQjIcb5_.js";
import "@primeuix/styles/virtualscroller";
import "./index-xRlVhXwl.js";
import "./index-BDpKneMc.js";
import "@primeuix/styles/select";
import "./index-C5syhl6-.js";
import "./index-BLBoPBG9.js";
import "./index-CEjm7QwF.js";
import "@primeuix/styles/inputnumber";
import "./index-CyoypR2R.js";
import "@primeuix/styles/datatable";
import "./index-BSlrD5b6.js";
import "./index-CZMkDb0s.js";
import "./index-BbItI6CA.js";
import "./index-BkujatKk.js";
import "@primeuix/styles/checkbox";
import "./index-Cxcz8NQM.js";
import "@primeuix/styles/radiobutton";
import "./index-CPX8QLh4.js";
import "./index-Cn5F1NyX.js";
import "./index-D6DLQGdG.js";
import "@primeuix/styles/inputtext";
import "@primeuix/styles/tag";
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
import "@primeuix/styles/base";
import "@tanstack/vue-query";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "audit",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useAcceptanceStore();
    const toast = useToast();
    const keyword = ref("");
    const rows = computed(() => store.audit.filter((item) => !keyword.value || `${item.entityId} ${item.action} ${item.operator} ${item.detail}`.includes(keyword.value)));
    const sign = () => {
      const result = store.signOff();
      toast.add({ severity: result.ok ? "success" : "error", summary: result.ok ? "签署完成" : "完整性校验未通过", detail: result.message, life: 4e3 });
    };
    const exportPackage = () => {
      const payload = { plant: store.plant, equipment: store.equipment, defects: store.defects, audit: store.audit, preflight: store.preflight };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = (void 0).createElement("a");
      anchor.href = url;
      anchor.download = "光伏并网验收交付包.json";
      anchor.click();
      URL.revokeObjectURL(url);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}><div class="preflight-panel"><div><span>并网前完整性校验</span><strong>${ssrInterpolate(unref(store).preflight.allowed ? "全部条件满足" : `${unref(store).preflight.blocking.length}项阻断`)}</strong><!--[-->`);
      ssrRenderList(unref(store).preflight.blocking, (item) => {
        _push(`<p>${ssrInterpolate(item)}</p>`);
      });
      _push(`<!--]--></div><div>`);
      _push(ssrRenderComponent(unref(script), {
        label: "导出交付包",
        outlined: "",
        onClick: exportPackage
      }, null, _parent));
      _push(ssrRenderComponent(unref(script), {
        label: "签署并锁定版本",
        onClick: sign
      }, null, _parent));
      _push(`</div></div><div class="section-head"><div><h2>验收审计</h2><p>当前交付版本 V${ssrInterpolate(unref(store).plant.version)} · ${ssrInterpolate(unref(store).plant.status)}</p></div>`);
      _push(ssrRenderComponent(unref(script$1), {
        modelValue: keyword.value,
        "onUpdate:modelValue": ($event) => keyword.value = $event,
        placeholder: "搜索实体、动作或操作人"
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(unref(script$2), {
        value: rows.value,
        dataKey: "id",
        size: "small"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(script$3), {
              field: "createdAt",
              header: "时间"
            }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(data.createdAt.replace("T", " ").slice(0, 16))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(data.createdAt.replace("T", " ").slice(0, 16)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), {
              field: "entityId",
              header: "实体"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), {
              field: "action",
              header: "动作"
            }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(script$4), {
                    value: data.action
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(script$4), {
                      value: data.action
                    }, null, 8, ["value"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), {
              field: "operator",
              header: "操作人"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), {
              field: "detail",
              header: "说明"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(script$3), {
                field: "createdAt",
                header: "时间"
              }, {
                body: withCtx(({ data }) => [
                  createTextVNode(toDisplayString(data.createdAt.replace("T", " ").slice(0, 16)), 1)
                ]),
                _: 1
              }),
              createVNode(unref(script$3), {
                field: "entityId",
                header: "实体"
              }),
              createVNode(unref(script$3), {
                field: "action",
                header: "动作"
              }, {
                body: withCtx(({ data }) => [
                  createVNode(unref(script$4), {
                    value: data.action
                  }, null, 8, ["value"])
                ]),
                _: 1
              }),
              createVNode(unref(script$3), {
                field: "operator",
                header: "操作人"
              }),
              createVNode(unref(script$3), {
                field: "detail",
                header: "说明"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/audit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=audit-BPM9aU7r.js.map
