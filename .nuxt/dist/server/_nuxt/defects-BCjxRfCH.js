import { defineComponent, ref, reactive, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import script$4 from "./index-C22-1zmx.js";
import script$1 from "./index-ZhqI6K-b.js";
import script$2 from "./index-CjJTah8j.js";
import script$6 from "./index-BQnwOSSP.js";
import script from "./index-CJVC4OhG.js";
import script$7 from "./index-TSK8ySp0.js";
import script$3 from "./index-DDC9KImH.js";
import script$5 from "./index-FlP-jb7v.js";
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
import "vue-router";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/ufo/dist/index.mjs";
import "/Users/zhuanzmima0000/Desktop/Pair-wise/reposted-projects/pair-wise-gsb-67/node_modules/klona/dist/index.mjs";
import "@primeuix/styles/base";
import "@tanstack/vue-query";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "defects",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useAcceptanceStore();
    const toast = useToast();
    const selected = ref(null);
    const replyVisible = ref(false);
    const retestVisible = ref(false);
    const reply = reactive({ party: "设备厂家", owner: "", content: "", evidence: "", repliedAt: (/* @__PURE__ */ new Date()).toISOString() });
    const retest = reactive({ result: "", passed: true, note: "" });
    const rows = computed(() => store.defects.filter((item) => !store.keyword || `${item.id} ${item.title} ${item.owner} ${item.status}`.includes(store.keyword)));
    function open(defect) {
      selected.value = defect;
    }
    function submitReply() {
      if (!selected.value) return;
      const result = store.addReply(selected.value.id, { ...reply, repliedAt: (/* @__PURE__ */ new Date()).toISOString() });
      toast.add({ severity: result.ok ? "success" : "error", summary: result.message, life: 2500 });
      if (result.ok) replyVisible.value = false;
    }
    function submitRetest() {
      if (!selected.value || !retest.result) return;
      store.addRetest(selected.value.id, retest.result, retest.passed);
      toast.add({ severity: retest.passed ? "success" : "warn", summary: retest.passed ? "复验通过，缺陷已关闭" : "复验未通过，返回整改", life: 2500 });
      retestVisible.value = false;
    }
    function decide(status) {
      if (!selected.value) return;
      const result = store.decideDefect(selected.value.id, status, retest.note);
      toast.add({ severity: result.ok ? "success" : "error", summary: result.message, life: 3e3 });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}><div class="section-head"><div><h2>缺陷闭环处置</h2><p>建设、设备厂家与运维单位分别提交说明，验收负责人决定通过、退回或带条件接受。</p></div>`);
      _push(ssrRenderComponent(unref(script), {
        modelValue: unref(store).keyword,
        "onUpdate:modelValue": ($event) => unref(store).keyword = $event,
        placeholder: "搜索缺陷、责任方或状态"
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(unref(script$1), {
        value: rows.value,
        dataKey: "id",
        size: "small",
        selectionMode: "single",
        onRowSelect: (event) => open(event.data)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(script$2), {
              field: "id",
              header: "编号"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$2), {
              field: "title",
              header: "缺陷"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$2), {
              field: "equipmentId",
              header: "设备"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$2), {
              field: "severity",
              header: "严重度"
            }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(script$3), {
                    value: data.severity,
                    severity: data.severity === "重大" ? "danger" : "warn"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(script$3), {
                      value: data.severity,
                      severity: data.severity === "重大" ? "danger" : "warn"
                    }, null, 8, ["value", "severity"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$2), {
              field: "owner",
              header: "责任方"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$2), {
              field: "dueDate",
              header: "截止"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$2), { header: "状态" }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(script$3), {
                    value: data.status,
                    severity: data.status === "已关闭" ? "success" : data.status === "带条件通过" ? "info" : "warn"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(script$3), {
                      value: data.status,
                      severity: data.status === "已关闭" ? "success" : data.status === "带条件通过" ? "info" : "warn"
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
          } else {
            return [
              createVNode(unref(script$2), {
                field: "id",
                header: "编号"
              }),
              createVNode(unref(script$2), {
                field: "title",
                header: "缺陷"
              }),
              createVNode(unref(script$2), {
                field: "equipmentId",
                header: "设备"
              }),
              createVNode(unref(script$2), {
                field: "severity",
                header: "严重度"
              }, {
                body: withCtx(({ data }) => [
                  createVNode(unref(script$3), {
                    value: data.severity,
                    severity: data.severity === "重大" ? "danger" : "warn"
                  }, null, 8, ["value", "severity"])
                ]),
                _: 1
              }),
              createVNode(unref(script$2), {
                field: "owner",
                header: "责任方"
              }),
              createVNode(unref(script$2), {
                field: "dueDate",
                header: "截止"
              }),
              createVNode(unref(script$2), { header: "状态" }, {
                body: withCtx(({ data }) => [
                  createVNode(unref(script$3), {
                    value: data.status,
                    severity: data.status === "已关闭" ? "success" : data.status === "带条件通过" ? "info" : "warn"
                  }, null, 8, ["value", "severity"])
                ]),
                _: 1
              }),
              createVNode(unref(script$2), { header: "版本" }, {
                body: withCtx(({ data }) => [
                  createTextVNode("V" + toDisplayString(data.version), 1)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (selected.value) {
        _push(`<div class="detail-panel"><div class="detail-title"><div><span>${ssrInterpolate(selected.value.id)} · ${ssrInterpolate(selected.value.equipmentId)}</span><h3>${ssrInterpolate(selected.value.title)}</h3></div><div>`);
        _push(ssrRenderComponent(unref(script$4), {
          label: "多方回复",
          outlined: "",
          onClick: ($event) => replyVisible.value = true
        }, null, _parent));
        _push(ssrRenderComponent(unref(script$4), {
          label: "联合复验",
          onClick: ($event) => retestVisible.value = true
        }, null, _parent));
        _push(`</div></div><div class="reply-list"><!--[-->`);
        ssrRenderList(selected.value.replies, (item) => {
          _push(`<article>`);
          _push(ssrRenderComponent(unref(script$3), {
            value: item.party
          }, null, _parent));
          _push(`<strong>${ssrInterpolate(item.owner)}</strong><p>${ssrInterpolate(item.content)}</p><span>${ssrInterpolate(item.evidence)} · ${ssrInterpolate(item.repliedAt.replace("T", " ").slice(0, 16))}</span></article>`);
        });
        _push(`<!--]--></div><div class="decision-band">`);
        _push(ssrRenderComponent(unref(script$5), {
          modelValue: retest.note,
          "onUpdate:modelValue": ($event) => retest.note = $event,
          rows: "2",
          placeholder: "验收决定说明，带条件接受时必须填写限制条件"
        }, null, _parent));
        _push(ssrRenderComponent(unref(script$4), {
          label: "通过并关闭",
          onClick: ($event) => decide("已关闭")
        }, null, _parent));
        _push(ssrRenderComponent(unref(script$4), {
          label: "带条件接受",
          severity: "secondary",
          outlined: "",
          onClick: ($event) => decide("带条件通过")
        }, null, _parent));
        _push(ssrRenderComponent(unref(script$4), {
          label: "退回整改",
          severity: "danger",
          outlined: "",
          onClick: ($event) => decide("整改中")
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(unref(script$6), {
        visible: replyVisible.value,
        "onUpdate:visible": ($event) => replyVisible.value = $event,
        header: "提交多方处理说明",
        modal: "",
        style: { width: "580px" }
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(script$4), {
              label: "取消",
              text: "",
              severity: "secondary",
              onClick: ($event) => replyVisible.value = false
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$4), {
              label: "提交并进入复验",
              onClick: submitReply
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(script$4), {
                label: "取消",
                text: "",
                severity: "secondary",
                onClick: ($event) => replyVisible.value = false
              }, null, 8, ["onClick"]),
              createVNode(unref(script$4), {
                label: "提交并进入复验",
                onClick: submitReply
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="edit-grid"${_scopeId}><label${_scopeId}>责任方`);
            _push2(ssrRenderComponent(unref(script$7), {
              modelValue: reply.party,
              "onUpdate:modelValue": ($event) => reply.party = $event,
              options: ["建设单位", "设备厂家", "运维单位"]
            }, null, _parent2, _scopeId));
            _push2(`</label><label${_scopeId}>回复人`);
            _push2(ssrRenderComponent(unref(script), {
              modelValue: reply.owner,
              "onUpdate:modelValue": ($event) => reply.owner = $event
            }, null, _parent2, _scopeId));
            _push2(`</label><label${_scopeId}>处理说明`);
            _push2(ssrRenderComponent(unref(script$5), {
              modelValue: reply.content,
              "onUpdate:modelValue": ($event) => reply.content = $event,
              rows: "4"
            }, null, _parent2, _scopeId));
            _push2(`</label><label${_scopeId}>证据附件`);
            _push2(ssrRenderComponent(unref(script), {
              modelValue: reply.evidence,
              "onUpdate:modelValue": ($event) => reply.evidence = $event,
              placeholder: "整改记录或报告名称"
            }, null, _parent2, _scopeId));
            _push2(`</label></div>`);
          } else {
            return [
              createVNode("div", { class: "edit-grid" }, [
                createVNode("label", null, [
                  createTextVNode("责任方"),
                  createVNode(unref(script$7), {
                    modelValue: reply.party,
                    "onUpdate:modelValue": ($event) => reply.party = $event,
                    options: ["建设单位", "设备厂家", "运维单位"]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("label", null, [
                  createTextVNode("回复人"),
                  createVNode(unref(script), {
                    modelValue: reply.owner,
                    "onUpdate:modelValue": ($event) => reply.owner = $event
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("label", null, [
                  createTextVNode("处理说明"),
                  createVNode(unref(script$5), {
                    modelValue: reply.content,
                    "onUpdate:modelValue": ($event) => reply.content = $event,
                    rows: "4"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("label", null, [
                  createTextVNode("证据附件"),
                  createVNode(unref(script), {
                    modelValue: reply.evidence,
                    "onUpdate:modelValue": ($event) => reply.evidence = $event,
                    placeholder: "整改记录或报告名称"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(script$6), {
        visible: retestVisible.value,
        "onUpdate:visible": ($event) => retestVisible.value = $event,
        header: "登记联合复验",
        modal: "",
        style: { width: "520px" }
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(script$4), {
              label: "取消",
              text: "",
              severity: "secondary",
              onClick: ($event) => retestVisible.value = false
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(script$4), {
              label: "提交复验轮次",
              onClick: submitRetest
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(script$4), {
                label: "取消",
                text: "",
                severity: "secondary",
                onClick: ($event) => retestVisible.value = false
              }, null, 8, ["onClick"]),
              createVNode(unref(script$4), {
                label: "提交复验轮次",
                onClick: submitRetest
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="edit-grid"${_scopeId}><label${_scopeId}>复验结果`);
            _push2(ssrRenderComponent(unref(script$5), {
              modelValue: retest.result,
              "onUpdate:modelValue": ($event) => retest.result = $event,
              rows: "4"
            }, null, _parent2, _scopeId));
            _push2(`</label><label${_scopeId}>结论`);
            _push2(ssrRenderComponent(unref(script$7), {
              modelValue: retest.passed,
              "onUpdate:modelValue": ($event) => retest.passed = $event,
              options: [{ label: "通过", value: true }, { label: "不通过", value: false }]
            }, null, _parent2, _scopeId));
            _push2(`</label></div>`);
          } else {
            return [
              createVNode("div", { class: "edit-grid" }, [
                createVNode("label", null, [
                  createTextVNode("复验结果"),
                  createVNode(unref(script$5), {
                    modelValue: retest.result,
                    "onUpdate:modelValue": ($event) => retest.result = $event,
                    rows: "4"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("label", null, [
                  createTextVNode("结论"),
                  createVNode(unref(script$7), {
                    modelValue: retest.passed,
                    "onUpdate:modelValue": ($event) => retest.passed = $event,
                    options: [{ label: "通过", value: true }, { label: "不通过", value: false }]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/defects.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=defects-BCjxRfCH.js.map
