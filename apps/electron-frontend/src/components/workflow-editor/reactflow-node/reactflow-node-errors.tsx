import { ComfyUIErrorTypes, ComfyUINodeError, SDNode } from "@comflowy/common/types";
import { useCallback, useState } from "react";
import nodeStyles from "./reactflow-node.style.module.scss";
import { Button, Popover } from "antd";
import { useExtensionsState } from "@comflowy/common/store/extension-state";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";

export function NodeError({ nodeError }: { nodeError?: ComfyUINodeError }) {
  const [visible, setVisible] = useState(false);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  if (!nodeError || nodeError.errors.length === 0) {
    return null
  }

  const errorsEl = (
    <div className={nodeStyles.nodeErrors}>
      {nodeError.errors.map((error, index) => (
        <div key={index} className="node-error">
          {error.message + ":" + error.details}
        </div>
      ))}
    </div>
  )

  return (
    <div className={nodeStyles.nodeErrorWrapper}>
      <Popover
        title={null}
        content={errorsEl}
        trigger="hover"
      >
        Errors
      </Popover>
    </div>
  )
}

export function InstallMissingWidget(props: {
  nodeError?: ComfyUINodeError;
  node: SDNode;
}) {
  const extensionsNodeMap = useExtensionsState(st => st.extensionNodeMap);
  const { nodeError, node } = props;
  const installWidget = useCallback((extension) => {
    SlotGlobalEvent.emit({
      type: GlobalEvents.show_missing_widgets_modal,
      data: null
    });
    setTimeout(() => {
      SlotGlobalEvent.emit({
        type: GlobalEvents.install_missing_widget,
        data: extension
      });
      SlotGlobalEvent.emit({
        type: GlobalEvents.show_comfyprocess_manager,
        data: null
      });
    }, 10);
  }, []);

  if (!nodeError) {
    return null;
  }

  const widgetNotFoundError = nodeError.errors.find(err => err.type === ComfyUIErrorTypes.widget_not_found);

  if (!widgetNotFoundError) {
    return null;
  }

  const widget = node.widget;
  const extension = extensionsNodeMap[widget];
  if (!extension) {
    return null
  } else {
    console.log("miss extension", extension, node);
  }

  return (
    <div className="install-missing-widget nodrag">
      <Button type="primary" onClick={ev => {
        installWidget(extension);
      }}>Install "{extension.title}"</Button>
    </div>
  )
}

