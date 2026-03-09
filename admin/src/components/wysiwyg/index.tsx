import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { PureComponent } from 'react';
import { Editor } from 'react-draft-wysiwyg';

interface IProps {
  // eslint-disable-next-line react/require-default-props
  onChange?: Function;
  // eslint-disable-next-line react/require-default-props
  html?: string;
}

interface IState {
  editorState: any;
  showSource: boolean;
  editorHtml: string;
}

export default class WYSIWYG extends PureComponent<IProps, IState> {
  constructor(props: any) {
    super(props);
    const { html } = this.props;
    if (html) {
      const blocksFromHtml = htmlToDraft(html);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      this.state = {
        editorState: EditorState.createWithContent(contentState),
        showSource: false,
        editorHtml: html
      };
    } else {
      this.state = {
        editorState: EditorState.createEmpty(),
        showSource: false,
        editorHtml: ''
      };
    }
  }

  onEditorStateChange: Function = (editorState) => {
    const { onChange } = this.props;
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    onChange
      && onChange({
        html
      });

    this.setState({
      editorState,
      editorHtml: html
    });
  };

  onEditEditorHTML = (e) => {
    const editorHtml = e.target.value;

    let editorState;
    const contentBlock = htmlToDraft(editorHtml);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      editorState = EditorState.createWithContent(contentState);
    } else {
      editorState = EditorState.createEmpty();
    }
    this.setState({
      editorState,
      editorHtml
    });
  };

  toggleEditorCode = () => {
    const { showSource } = this.state;
    this.setState({ showSource: !showSource });
  };

  showEditorCode = (showSource: boolean) => (
    <button type="button" className="rdw-option-wrapper" onClick={this.toggleEditorCode}>
      {showSource ? 'Hide Source' : 'View Source'}
    </button>
  );

  render() {
    const { editorState, showSource, editorHtml } = this.state;

    return (
      <div className="editor">
        <Editor
          editorState={editorState}
          wrapperClassName="wysityg-wrapper"
          editorClassName="wysityg-editor"
          onEditorStateChange={this.onEditorStateChange}
          toolbarCustomButtons={[this.showEditorCode(showSource)]}
          toolbar={
            {
              // image: {
              //   uploadCallback: uploadImageCallBack,
              //   alt: { present: true, mandatory: true }
              // }
            }
          }
        />
        {showSource && (
          <textarea
            value={editorHtml}
            onChange={this.onEditEditorHTML}
            style={{ width: '100%' }}
            rows={4}
          />
        )}
      </div>
    );
  }
}
