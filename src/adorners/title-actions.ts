import * as ko from "knockout";
import {
  registerAdorner,
  SurveyForDesigner,
  ISurveyObjectMenuItem,
} from "../surveyjsObjects";
import { editorLocalization } from "../editorLocalization";
import * as Survey from "survey-knockout";

import "./title-actions.scss";
var templateHtml = require("html-loader?interpolate!val-loader!./title-actions.html");

export class TitleActionsViewModel {
  constructor(
    public survey: SurveyForDesigner,
    protected input: HTMLInputElement,
    protected rootElement
  ) {
    this.actions.push({
      name: "editelement",
      visible: ko.computed(() => survey.koShowHeader()),
      text: this.getLocString("pe.chooseLogo"),
      hasTitle: true,
      onClick: (model: SurveyForDesigner) => {
        if (!window["FileReader"]) return;
        this.input.value = "";
        this.input.onchange = () => {
          if (!this.input || !this.input.files || this.input.files.length < 1)
            return;
          let files = [];
          for (let i = 0; i < this.input.files.length; i++) {
            files.push(this.input.files[i]);
          }
          if (!files[0]) return;
          survey.getEditor().uploadFiles(files, (_, link) => {
            survey.logo = link;
          });
        };
        this.input.click();
      },
    });
    this.actions.push(<any>{
      name: "setLogoPosition",
      text: this.getLocString("pe.logoPosition"),
      visible: ko.computed(() => survey.koShowHeader()),
      value: survey.logoPosition,
      template: "choice-action",
      choices: [
        { value: "none", text: this.getLocString("pe.logo.none") },
        { value: "left", text: this.getLocString("pe.logo.left") },
        { value: "right", text: this.getLocString("pe.logo.right") },
        { value: "top", text: this.getLocString("pe.logo.top") },
        { value: "bottom", text: this.getLocString("pe.logo.bottom") },
      ],
      onClick: (data, event) => {
        var newValue = event.target.value;
        survey.logoPosition = newValue;
      },
    });
    this.actions.push(<any>{
      visible: ko.computed(() => survey.koShowHeader()),
      template: "action-separator",
    });
    this.actions.push({
      name: "showSurveyTitle",
      visible: true,
      text: this.getLocString("pe.showTitle"),
      icon: ko.computed(() => {
        if (!survey.koShowHeader()) {
          return "icon-actionshowtitle";
        }
        return "icon-actionhidetitle";
      }),
      onClick: (survey: SurveyForDesigner) => {
        survey.koShowHeader(!survey.koShowHeader());
      },
    });
    ko.computed(() => {
      var headerContainer: HTMLDivElement = this.rootElement.parentElement
        .parentElement;
      if (survey.koShowHeader()) {
        headerContainer.classList.remove("svd_survey_header--hidden");
      } else {
        headerContainer.classList.add("svd_survey_header--hidden");
      }
    });
  }

  public getLocString(str: string) {
    return editorLocalization.getString(str);
  }

  public getStyle(model: ISurveyObjectMenuItem) {
    if (!!model.icon) {
      return ko.unwrap(<any>model.icon);
    }
    return "icon-action" + model.name;
  }

  actions = ko.observableArray<ISurveyObjectMenuItem>();
}

ko.components.register("title-actions", {
  viewModel: {
    createViewModel: (params, componentInfo) => {
      var model = new TitleActionsViewModel(
        params.survey,
        params.input,
        componentInfo.element
      );
      return model;
    },
  },
  template: templateHtml,
});