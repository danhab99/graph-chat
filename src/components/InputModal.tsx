import { useReactFlow } from "@xyflow/react";
import { createContext, useContext, useRef, useState } from "react";

const InputModalContext = createContext<(nodeId: string) => Promise<string>>(
  (x) => Promise.resolve(""),
);

export function useInput() {
  return useContext(InputModalContext);
}

export function InputModalProvider(props: React.PropsWithChildren<{}>) {
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { setNodes } = useReactFlow();

  const resolveFunc = useRef<(value: string | PromiseLike<string>) => void>(
    () => {},
  );

  const cancelEdit = () => {
    resolveFunc.current("");
    setEditingNodeId(null);
    setEditText("");
  };

  const saveEdit = () => {
    if (editingNodeId) {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === editingNodeId
            ? { ...node, data: { ...node.data, label: editText } }
            : node,
        ),
      );
      resolveFunc.current?.(editText);
      setEditingNodeId(null);
      setEditText("");
    }
  };

  return (
    <InputModalContext.Provider
      value={(nodeId) =>
        new Promise((resolve) => {
          setEditingNodeId(nodeId);
          resolveFunc.current = resolve;
        })
      }
    >
      {editingNodeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Prompt</h3>
            <textarea
              className="w-full h-32 p-2 border border-gray-300 rounded-md resize-none"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter your prompt text here..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={cancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {props.children}
    </InputModalContext.Provider>
  );
}
