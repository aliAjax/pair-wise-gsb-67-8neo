import { defineComponent, computed, ref, reactive, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { useRoute } from "vue-router";
import script$3 from "./index-C22-1zmx.js";
import script$1 from "./index-ZhqI6K-b.js";
import script$2 from "./index-CjJTah8j.js";
import script$4 from "./index-BQnwOSSP.js";
import script$6 from "./index-CJVC4OhG.js";
import script$5 from "./index-TSK8ySp0.js";
import script from "./index-DDC9KImH.js";
import script$7 from "./index-FlP-jb7v.js";
import { u as useAcceptanceStore } from "../server.mjs";
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
import "./index-C5syhl6-.js";
import "./index-BLBoPBG9.js";
import "./index-CEjm7QwF.js";
import "./index-BJFn3Jal.js";
import "./index-xRlVhXwl.js";
import "./index-BDpKneMc.js";
import "@primeuix/styles/inputnumber";
import "./index-CyoypR2R.js";
import "./index-BQjIcb5_.js";
import "@primeuix/styles/virtualscroller";
import "@primeuix/styles/datatable";
import "./index-CobSNMix.js";
import "./index-BSlrD5b6.js";
import "./index-CZMkDb0s.js";
import "./index-CP_fvbAb.js";
import "./index-rAVNvoJo.js";
import "@primeuix/utils/eventbus";
import "./index-BbItI6CA.js";
import "./index-BkujatKk.js";
import "@primeuix/styles/checkbox";
import "./index-Cxcz8NQM.js";
import "@primeuix/styles/radiobutton";
import "@primeuix/utils/zindex";
import "./index-CPX8QLh4.js";
import "./index-Cn5F1NyX.js";
import "./index-zZrFrjQS.js";
import "./index-D6DLQGdG.js";
import "./index-Din928lO.js";
import "@primeuix/styles/dialog";
import "@primeuix/styles/inputtext";
import "./index-BH9iduCK.js";
import "./index-CLrwot36.js";
import "./index-B_yMes1y.js";
import "@primeuix/styles/iconfield";
import "./index-DEIL5kug.js";
import "@primeuix/styles/select";
import "@primeuix/styles/tag";
import "@primeuix/styles/textarea";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/hookable/dist/index.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/unctx/dist/index.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/defu/dist/defu.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/ufo/dist/index.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/klona/dist/index.mjs";
import "@primeuix/styles/base";
import "@tanstack/vue-query";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const store = useAcceptanceStore();
    const node = computed(() => store.equipment.find((item) => item.id === route.params.id));
    const visible = ref(false);
    const editable = reactive({});
    function openItem(item) {
      Object.assign(editable, structuredClone(item));
      visible.value = true;
    }
    function save() {
      if (!node.value || !editable.id) return;
      store.updateItem(node.value.id, editable.id, editable);
      visible.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (node.value) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}><div class="section-head"><div><span>${ssrInterpolate(node.value.id)} · ${ssrInterpolate(node.value.code)}</span><h2>${ssrInterpolate(node.value.name)}</h2><p>${ssrInterpolate(node.value.type)} · 当前状态 ${ssrInterpolate(node.value.status)}</p></div>`);
        _push(ssrRenderComponent(unref(script), {
          value: node.value.status,
          severity: node.value.status === "已验收" ? "success" : "warn"
        }, null, _parent));
        _push(`</div><div class="equipment-path"><!--[-->`);
        ssrRenderList(unref(store).equipment.filter((value) => value.parentId === node.value.parentId || value.id === node.value.id), (item) => {
          _push(`<span class="${ssrRenderClass({ active: item.id === node.value.id })}">${ssrInterpolate(item.name)}</span>`);
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(unref(script$1), {
          value: node.value.items,
          dataKey: "id",
          size: "small"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(script$2), {
                field: "id",
                header: "编号",
                style: { "width": "100px" }
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), {
                field: "standard",
                header: "验收标准"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), {
                field: "method",
                header: "测试方法"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), {
                field: "condition",
                header: "测试条件"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), {
                field: "measured",
                header: "实测结果"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), {
                field: "evidence",
                header: "测试证据"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), { header: "状态" }, {
                body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(script), {
                      value: data.status,
                      severity: data.status === "合格" ? "success" : data.status === "不合格" ? "danger" : "warn"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(script), {
                        value: data.status,
                        severity: data.status === "合格" ? "success" : data.status === "不合格" ? "danger" : "warn"
                      }, null, 8, ["value", "severity"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), { header: "版本" }, {
                body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`V${ssrInterpolate(data.version)}`);
                  } else {
                    return [
                      createTextVNode("V" + toDisplayString(data.version), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$2), { header: "" }, {
                body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(script$3), {
                      label: "录入/复核",
                      text: "",
                      onClick: ($event) => openItem(data)
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(script$3), {
                        label: "录入/复核",
                        text: "",
                        onClick: ($event) => openItem(data)
                      }, null, 8, ["onClick"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(unref(script$2), {
                  field: "id",
                  header: "编号",
                  style: { "width": "100px" }
                }),
                createVNode(unref(script$2), {
                  field: "standard",
                  header: "验收标准"
                }),
                createVNode(unref(script$2), {
                  field: "method",
                  header: "测试方法"
                }),
                createVNode(unref(script$2), {
                  field: "condition",
                  header: "测试条件"
                }),
                createVNode(unref(script$2), {
                  field: "measured",
                  header: "实测结果"
                }),
                createVNode(unref(script$2), {
                  field: "evidence",
                  header: "测试证据"
                }),
                createVNode(unref(script$2), { header: "状态" }, {
                  body: withCtx(({ data }) => [
                    createVNode(unref(script), {
                      value: data.status,
                      severity: data.status === "合格" ? "success" : data.status === "不合格" ? "danger" : "warn"
                    }, null, 8, ["value", "severity"])
                  ]),
                  _: 1
                }),
                createVNode(unref(script$2), { header: "版本" }, {
                  body: withCtx(({ data }) => [
                    createTextVNode("V" + toDisplayString(data.version), 1)
                  ]),
                  _: 1
                }),
                createVNode(unref(script$2), { header: "" }, {
                  body: withCtx(({ data }) => [
                    createVNode(unref(script$3), {
                      label: "录入/复核",
                      text: "",
                      onClick: ($event) => openItem(data)
                    }, null, 8, ["onClick"])
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="certificate-panel"><h3>证书与测试附件</h3><!--[-->`);
        ssrRenderList(node.value.certificates, (certificate) => {
          _push(`<div class="certificate-item">`);
          _push(ssrRenderComponent(unref(script), {
            value: certificate.verified ? "已核验" : "待核验",
            severity: certificate.verified ? "success" : "danger"
          }, null, _parent));
          _push(`<strong>${ssrInterpolate(certificate.name)}</strong><span>${ssrInterpolate(certificate.issuer)}</span><span>有效期至 ${ssrInterpolate(certificate.expiresAt)}</span><small>V${ssrInterpolate(certificate.version)}</small></div>`);
        });
        _push(`<!--]-->`);
        if (!node.value.certificates.length) {
          _push(`<p>当前设备节点暂无证书附件。</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(unref(script$4), {
          visible: unref(visible),
          "onUpdate:visible": ($event) => isRef(visible) ? visible.value = $event : null,
          header: "录入验收项",
          modal: "",
          style: { width: "620px" }
        }, {
          footer: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(script$3), {
                label: "取消",
                severity: "secondary",
                text: "",
                onClick: ($event) => visible.value = false
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(script$3), {
                label: "保存并递增版本",
                onClick: save
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(unref(script$3), {
                  label: "取消",
                  severity: "secondary",
                  text: "",
                  onClick: ($event) => visible.value = false
                }, null, 8, ["onClick"]),
                createVNode(unref(script$3), {
                  label: "保存并递增版本",
                  onClick: save
                })
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="edit-grid"${_scopeId}><label${_scopeId}>状态`);
              _push2(ssrRenderComponent(unref(script$5), {
                modelValue: editable.status,
                "onUpdate:modelValue": ($event) => editable.status = $event,
                options: ["待检查", "合格", "不合格", "待复验"]
              }, null, _parent2, _scopeId));
              _push2(`</label><label${_scopeId}>实测结果`);
              _push2(ssrRenderComponent(unref(script$6), {
                modelValue: editable.measured,
                "onUpdate:modelValue": ($event) => editable.measured = $event
              }, null, _parent2, _scopeId));
              _push2(`</label><label${_scopeId}>测试证据`);
              _push2(ssrRenderComponent(unref(script$6), {
                modelValue: editable.evidence,
                "onUpdate:modelValue": ($event) => editable.evidence = $event
              }, null, _parent2, _scopeId));
              _push2(`</label><label${_scopeId}>测试条件`);
              _push2(ssrRenderComponent(unref(script$7), {
                modelValue: editable.condition,
                "onUpdate:modelValue": ($event) => editable.condition = $event,
                rows: "3"
              }, null, _parent2, _scopeId));
              _push2(`</label></div>`);
            } else {
              return [
                createVNode("div", { class: "edit-grid" }, [
                  createVNode("label", null, [
                    createTextVNode("状态"),
                    createVNode(unref(script$5), {
                      modelValue: editable.status,
                      "onUpdate:modelValue": ($event) => editable.status = $event,
                      options: ["待检查", "合格", "不合格", "待复验"]
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("label", null, [
                    createTextVNode("实测结果"),
                    createVNode(unref(script$6), {
                      modelValue: editable.measured,
                      "onUpdate:modelValue": ($event) => editable.measured = $event
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("label", null, [
                    createTextVNode("测试证据"),
                    createVNode(unref(script$6), {
                      modelValue: editable.evidence,
                      "onUpdate:modelValue": ($event) => editable.evidence = $event
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("label", null, [
                    createTextVNode("测试条件"),
                    createVNode(unref(script$7), {
                      modelValue: editable.condition,
                      "onUpdate:modelValue": ($event) => editable.condition = $event,
                      rows: "3"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}>未找到设备节点</section>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/equipment/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_id_-CDW5Gc_b.js.map
