"use client";
import React, { useRef, useState } from "react";
import {
  MDXEditor,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  UndoRedo,
  headingsPlugin,
  listsPlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

function MDXEditorWithBlockTypeSelect() {
  const [submittedContent, setSubmittedContent] = useState("");
  const [editorContent, setEditorContent] = useState("# Hello world");
  const editorRef = useRef(null);

  const handleSubmit = () => {
    setSubmittedContent(editorContent);
  };

  return (
    <div className="bg-cblack">
      <MDXEditor
        ref={editorRef}
        markdown={editorContent}
        contentEditableClassName="prose"
        onChange={setEditorContent}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          thematicBreakPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
              </>
            ),
            }),
        ]}
      />
      <button style={{ marginTop: 16 }} onClick={handleSubmit}>
        Submit
      </button>
      {submittedContent && (
        <div style={{ marginTop: 24 }}>
          <h3>Submitted Content:</h3>
          <p>{submittedContent}</p>
        </div>
      )}
    </div>
  );
}

export default MDXEditorWithBlockTypeSelect;
