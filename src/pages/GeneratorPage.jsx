import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../index.css";

const commandOptions = [
  "installDependenciesCmd",
  "installGoCmd",
  "setEnvCmd",
  "downloadBinaryCmd",
  "initNodeCmd",
  "configNodeCmd",
  "setPortsCmd",
  "setAppConfigCmd",
  "disableIndexerCmd",
  "createServiceCmd",
  "startNodeCmd",
  "snapshotCmd",
];

const GeneratorPage = () => {
  // Project info
  const [projectName, setProjectName] = useState("");
  const [chainId, setChainId] = useState("");
  const [networkType, setNetworkType] = useState("Testnet");

  // Commands
  const [commandBoxes, setCommandBoxes] = useState([]);
  const [selectedCommand, setSelectedCommand] = useState(commandOptions[0]);

  // Binary & denom
  const [binaryName, setBinaryName] = useState("");
  const [denom, setDenom] = useState("");
  const [microDenom, setMicroDenom] = useState("");

  // URLs
  const [urls, setUrls] = useState({
    repo: "",
    genesisUrl: "",
    addrbookUrl: "",
    snapshotUrl: "",
    explorerUrl: "",
    docsUrl: "",
    officialSite: "",
  });

  // Preview
  const [jsPreview, setJsPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Command box handlers
  const addCommandBox = () => {
    setCommandBoxes([...commandBoxes, { id: Date.now(), type: selectedCommand, value: "" }]);
  };
  const updateCommandBox = (id, newValue) => {
    setCommandBoxes(commandBoxes.map(box => box.id === id ? { ...box, value: newValue } : box));
  };
  const deleteCommandBox = (id) => {
    setCommandBoxes(commandBoxes.filter(box => box.id !== id));
  };

  // URL handler
  const updateUrl = (key, value) => setUrls({ ...urls, [key]: value });

  // Generate preview
  const generatePreview = () => {
    const commandsObject = commandBoxes.reduce((acc, box) => {
      acc[box.type] = box.value;
      return acc;
    }, {});

    commandsObject.binaryName = binaryName;
    commandsObject.denom = denom;
    commandsObject.microDenom = microDenom;

    const projectObject = {
      name: projectName || "GeneratedProject",
      networkLabel: networkType,
      logo: "", // optional, bisa diisi manual nanti
      chainId: chainId || "chain-id",
      blockHeight: "N/A",
      rpcStatus: true,
      commands: commandsObject,
      urls,
    };

    setJsPreview(`const ${projectName.replace(/\s+/g, "") || "GeneratedProject"} = ${JSON.stringify(projectObject, null, 2)};
export default ${projectName.replace(/\s+/g, "") || "GeneratedProject"};`);
    setShowPreview(true);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(jsPreview);
    alert("JS code copied to clipboard!");
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(commandBoxes);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setCommandBoxes(items);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">JS Generator</h1>

      {/* Project Info */}
      <div className="form-grid mb-6">
        <div>
          <label className="label">Project Name</label>
          <input value={projectName} onChange={e => setProjectName(e.target.value)} />
        </div>
        <div>
          <label className="label">Chain ID</label>
          <input value={chainId} onChange={e => setChainId(e.target.value)} />
        </div>
        <div>
          <label className="label">Network Type</label>
          <select value={networkType} onChange={e => setNetworkType(e.target.value)}>
            <option value="Testnet">Testnet</option>
            <option value="Mainnet">Mainnet</option>
          </select>
        </div>
      </div>

      {/* Binary & Denom */}
      <div className="form-grid mb-6">
        <div>
          <label className="label">Binary Name</label>
          <input value={binaryName} onChange={e => setBinaryName(e.target.value)} />
        </div>
        <div>
          <label className="label">Denom</label>
          <input value={denom} onChange={e => setDenom(e.target.value)} />
        </div>
        <div>
          <label className="label">Micro Denom</label>
          <input value={microDenom} onChange={e => setMicroDenom(e.target.value)} />
        </div>
      </div>

      {/* URLs */}
      <h2 className="font-bold mb-2">Project URLs</h2>
      <div className="form-grid mb-6">
        {Object.keys(urls).map(key => (
          <div key={key}>
            <label className="label">{key}</label>
            <input value={urls[key]} onChange={e => updateUrl(key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* Commands */}
      <div className="button-group mb-6">
        <select className="flex-1 p-2 rounded border bg-slate-800 text-white"
          value={selectedCommand} onChange={e => setSelectedCommand(e.target.value)}>
          {commandOptions.map(cmd => <option key={cmd} value={cmd}>{cmd}</option>)}
        </select>
        <button className="add" onClick={addCommandBox}>Add Command Box</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="commands">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4 mb-6">
              {commandBoxes.map((box, index) => (
                <Draggable key={box.id} draggableId={box.id.toString()} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                      className="relative border p-3 rounded bg-slate-800 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold">{box.type}</label>
                        <button className="delete" onClick={() => deleteCommandBox(box.id)}>X</button>
                      </div>
                      <textarea className="w-full mt-2 p-2 rounded border bg-slate-900 text-white"
                        rows={5} value={box.value} onChange={e => updateCommandBox(box.id, e.target.value)} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Action Buttons */}
      <div className="button-group mb-6">
        <button className="generate" onClick={generatePreview}>Preview JS</button>
        {showPreview && (
          <>
            <button className="copy" onClick={copyAll}>Copy All</button>
            <button className="delete" onClick={() => setShowPreview(false)}>Close Preview</button>
          </>
        )}
      </div>

      {/* JS Preview */}
      {showPreview && (
        <div className="mb-4">
          <h2 className="font-bold mb-2">JS Preview</h2>
          <pre className="code-block">{jsPreview}</pre>
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;
