# flask web server
import requests
from flask import Flask
import langchain
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
loader = TextLoader("../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
retriever = db.as_retriever(top_k=5)

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'
@app.route('/user_manual', methods=['GET'])
def user_manual():
    # user RAG to get the cotext
    input_text = requests.Request("GET", "https://api.openai.com/v1/edits")
    docs = retriever.get_relevant_documents(input_text)
    context = '. '.join([doc.page_content for doc in docs])

    # use the context to get the answer
    prompt = ("Answer the question based on the context given below"
    f"\nContext: {context}")
    chain = langchain.MockChain(prompt= prompt, llm=langchain.MockLLM())
    final_answer =  "chain_response"
    return final_answer