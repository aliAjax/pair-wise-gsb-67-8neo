import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { useQuery } from "@tanstack/vue-query";
import script$1 from "./index-C22-1zmx.js";
import script$2 from "./index-ZhqI6K-b.js";
import script$3 from "./index-CjJTah8j.js";
import script$4 from "./index-DDC9KImH.js";
import script from "./index-CJVC4OhG.js";
import { u as useAcceptanceStore, n as navigateTo } from "../server.mjs";
import { ofetch } from "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/ofetch/dist/node.mjs";
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
import "@primeuix/styles/tag";
import "@primeuix/styles/inputtext";
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
const client = ofetch.create({ baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || "/api", timeout: 5e3 });
async function loadEquipmentSnapshot(fallback) {
  if (!process.env.NUXT_PUBLIC_API_BASE_URL) return fallback;
  try {
    return await client("/acceptance/equipment");
  } catch {
    return fallback;
  }
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useAcceptanceStore();
    const { isFetching } = useQuery({ queryKey: ["equipment-snapshot"], queryFn: () => loadEquipmentSnapshot(store.equipment), staleTime: 6e4 });
    const rows = computed(() => store.equipment.filter((node) => {
      const items = node.items.map((item) => `${item.id} ${item.standard} ${item.status}`).join(" ");
      return !store.keyword || `${node.id} ${node.name} ${node.code} ${node.type} ${items}`.includes(store.keyword);
    }));
    const navigate = (id) => navigateTo(`/equipment/${id}`);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}><div class="metrics"><article><span>验收项</span><strong>${ssrInterpolate(unref(store).stats.total)}</strong><small>按设备树逐项检查</small></article><article><span>已合格</span><strong>${ssrInterpolate(unref(store).stats.passed)}</strong><small>测试条件与证据齐全</small></article><article><span>不合格或待复验</span><strong>${ssrInterpolate(unref(store).stats.failed)}</strong><small>不可直接签署</small></article><article><span>未闭环缺陷</span><strong>${ssrInterpolate(unref(store).stats.openDefects)}</strong><small>多方责任协同</small></article></div><div class="toolbar">`);
      _push(ssrRenderComponent(unref(script), {
        modelValue: unref(store).keyword,
        "onUpdate:modelValue": ($event) => unref(store).keyword = $event,
        placeholder: "搜索设备、编号、验收项或状态"
      }, null, _parent));
      _push(`<span>${ssrInterpolate(unref(isFetching) ? "正在同步" : "设备快照已加载")}</span>`);
      _push(ssrRenderComponent(unref(script$1), {
        label: "恢复演示数据",
        severity: "secondary",
        outlined: "",
        onClick: unref(store).reset
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(unref(script$2), {
        value: rows.value,
        dataKey: "id",
        size: "small",
        stripedRows: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(script$3), {
              field: "id",
              header: "设备节点"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), {
              field: "name",
              header: "名称"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), {
              field: "type",
              header: "类型"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), {
              field: "code",
              header: "编码"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), { header: "验收项" }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(data.items.filter((item) => item.status === "合格").length)} / ${ssrInterpolate(data.items.length)} 合格`);
                } else {
                  return [
                    createTextVNode(toDisplayString(data.items.filter((item) => item.status === "合格").length) + " / " + toDisplayString(data.items.length) + " 合格", 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), { header: "证书" }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(data.certificates.length)}份 · ${ssrInterpolate(data.certificates.filter((item) => !item.verified).length)}份待核`);
                } else {
                  return [
                    createTextVNode(toDisplayString(data.certificates.length) + "份 · " + toDisplayString(data.certificates.filter((item) => !item.verified).length) + "份待核", 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), { header: "状态" }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(script$4), {
                    value: data.status,
                    severity: data.status === "已验收" ? "success" : data.status === "验收中" ? "warn" : "secondary"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(script$4), {
                      value: data.status,
                      severity: data.status === "已验收" ? "success" : data.status === "验收中" ? "warn" : "secondary"
                    }, null, 8, ["value", "severity"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$3), { header: "" }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(script$1), {
                    label: "打开",
                    text: "",
                    onClick: ($event) => navigate(data.id)
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(script$1), {
                      label: "打开",
                      text: "",
                      onClick: ($event) => navigate(data.id)
                    }, null, 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(script$3), {
                field: "id",
                header: "设备节点"
              }),
              createVNode(unref(script$3), {
                field: "name",
                header: "名称"
              }),
              createVNode(unref(script$3), {
                field: "type",
                header: "类型"
              }),
              createVNode(unref(script$3), {
                field: "code",
                header: "编码"
              }),
              createVNode(unref(script$3), { header: "验收项" }, {
                body: withCtx(({ data }) => [
                  createTextVNode(toDisplayString(data.items.filter((item) => item.status === "合格").length) + " / " + toDisplayString(data.items.length) + " 合格", 1)
                ]),
                _: 1
              }),
              createVNode(unref(script$3), { header: "证书" }, {
                body: withCtx(({ data }) => [
                  createTextVNode(toDisplayString(data.certificates.length) + "份 · " + toDisplayString(data.certificates.filter((item) => !item.verified).length) + "份待核", 1)
                ]),
                _: 1
              }),
              createVNode(unref(script$3), { header: "状态" }, {
                body: withCtx(({ data }) => [
                  createVNode(unref(script$4), {
                    value: data.status,
                    severity: data.status === "已验收" ? "success" : data.status === "验收中" ? "warn" : "secondary"
                  }, null, 8, ["value", "severity"])
                ]),
                _: 1
              }),
              createVNode(unref(script$3), { header: "" }, {
                body: withCtx(({ data }) => [
                  createVNode(unref(script$1), {
                    label: "打开",
                    text: "",
                    onClick: ($event) => navigate(data.id)
                  }, null, 8, ["onClick"])
                ]),
                _: 1
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-D09-aI3D.js.map
