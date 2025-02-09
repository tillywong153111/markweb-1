import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function TodoList() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);
  const [docId, setDocId] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });

  // 保存光标位置
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const position = {
        start: range.startOffset,
        end: range.endOffset
      };
      localStorage.setItem('cursorPosition', JSON.stringify(position));
      setCursorPosition(position);
    }
  };

  // 恢复光标位置
  const restoreCursorPosition = () => {
    try {
      const savedPosition = JSON.parse(localStorage.getItem('cursorPosition')) || { start: 0, end: 0 };
      if (editorRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        
        // 确保有文本节点
        if (!editorRef.current.firstChild) {
          editorRef.current.appendChild(document.createTextNode(editorRef.current.innerText));
        }
        
        const textNode = editorRef.current.firstChild;
        const length = textNode.length;
        
        range.setStart(textNode, Math.min(savedPosition.start, length));
        range.setEnd(textNode, Math.min(savedPosition.end, length));
        
        selection.removeAllRanges();
        selection.addRange(range);
        
        // 滚动到光标位置
        const rect = range.getBoundingClientRect();
        const containerRect = editorRef.current.getBoundingClientRect();
        if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
          editorRef.current.scrollTop = rect.top - containerRect.top - containerRect.height / 2;
        }
      }
    } catch (e) {
      console.error('Error restoring cursor position:', e);
    }
  };

  // 获取内容
  const fetchContent = async () => {
    try {
      if (!auth.currentUser) return;
      
      setIsLoading(true);
      const q = query(
        collection(db, 'contents'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        setDocId(docData.id);
        const savedContent = docData.data().content || '';
        
        if (editorRef.current) {
          editorRef.current.innerText = savedContent;
          setContent(savedContent);
          // 内容加载完成后恢复光标位置
          setTimeout(restoreCursorPosition, 100);
        }
      } else {
        const newDoc = await addDoc(collection(db, 'contents'), {
          userId: auth.currentUser.uid,
          content: '',
          updatedAt: serverTimestamp()
        });
        setDocId(newDoc.id);
        if (editorRef.current) {
          editorRef.current.innerText = '';
          setContent('');
        }
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('获取内容失败：' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // 处理内容变化
  const handleInput = (e) => {
    const newContent = e.target.innerText;
    setContent(newContent);
    saveCursorPosition();
  };

  // 保存内容到数据库
  const saveContent = async () => {
    if (!auth.currentUser || !docId) return;

    try {
      setIsLoading(true);
      
      // 保存当前的选区
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      const end = range.endOffset;
      const node = range.startContainer;
      
      // 更新文档内容
      await setDoc(doc(db, 'contents', docId), {
        userId: auth.currentUser.uid,
        content: editorRef.current.innerText,
        updatedAt: serverTimestamp()
      });
      
      // 直接恢复选区，不重新获取内容
      try {
        const newRange = document.createRange();
        newRange.setStart(node, start);
        newRange.setEnd(node, end);
        selection.removeAllRanges();
        selection.addRange(newRange);
        editorRef.current.focus();
      } catch (e) {
        console.error('Error restoring cursor position:', e);
      }
    } catch (err) {
      console.error('保存失败:', err);
      setError('保存失败：' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理按键
  const handleKeyDown = async (e) => {
    // Ctrl + S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      await saveContent();
    }
  };

  return (
    <div className="w-screen h-screen bg-[#1e1e1e] text-gray-300">
      {/* 顶部操作栏 */}
      <div className="fixed top-0 right-0 w-full h-12 bg-[#1e1e1e] border-b border-gray-700 pr-16">
        <div className="absolute top-0 right-4 flex flex-col">
          <div className="mt-2">
            <span className="text-gray-400 text-sm">{auth.currentUser?.email}</span>
            <span className="mx-2 text-gray-700">|</span>
            <button
              onClick={() => auth.signOut()}
              className="text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              退出
            </button>
          </div>
          <div className="mt-1 text-right">
            <button 
              onClick={saveContent}
              className="text-gray-400 hover:text-white transition-colors text-sm"
              title="Ctrl+S"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 顶部背景 */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-[#1e1e1e] border-b border-gray-700 -z-10" />

      {/* 编辑器主体 */}
      <div className="pt-12 px-4 pb-4 h-full overflow-auto">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={saveCursorPosition}
          className="h-full w-full max-w-none px-8 py-6 text-gray-300 font-mono text-2xl leading-relaxed focus:outline-none whitespace-pre-wrap border border-gray-700 rounded-lg"
          style={{ 
            margin: '0',
            textAlign: 'left',
            maxWidth: 'none',
            width: '100%',
            outline: '1px solid #374151'
          }}
          spellCheck={false}
          placeholder="在此输入内容..."
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-8 right-4 p-4 bg-red-900 text-red-100 rounded shadow-lg">
          {error}
        </div>
      )}

      {/* 加载提示 */}
      {isLoading && (
        <div className="fixed top-14 right-4 px-4 py-2 bg-blue-500 text-white rounded shadow-lg">
          保存中...
        </div>
      )}
    </div>
  );
} 