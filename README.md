# 문장연습

논문 구조와 영어 표현을 익히는 가벼운 필사 웹앱입니다. 별도 패키지나 API 키가 필요하지 않습니다.

## 실행

```sh
cd /workspace/transcription
python3 -m http.server 3000 --bind 0.0.0.0
```

브라우저에서 서버의 3000번 포트로 접속합니다. HTML 파일을 직접 열면 데이터 로딩이 제한될 수 있으므로 HTTP 서버를 사용하세요.

## 기능

- 첨부 논문 초록 7문장, 문장 역할과 영어 표현 해설
- 원문 PDF 열기, 원문 가리기, 입력 비교와 완료 표시
- 문장별 메모와 필사 내용 브라우저 자동 저장
- 개인 문장 추가, Markdown 노트 다운로드
- 모바일 화면 지원

학습 해설은 별도로 작성한 설명이며 저자의 해설이 아닙니다. 일치도는 공백을 정규화한 문자 위치 기준으로 계산합니다. 데이터는 현재 브라우저와 접속 주소에만 저장되며 서버로 전송되지 않습니다. 브라우저 데이터 삭제 시 사라지므로 노트 다운로드로 보관하세요. PDF 추가 업로드나 자동 문장 추출 기능은 포함하지 않습니다.

기본 자료: Jong-Kook Kim et al., “Dynamic Resource Management in Energy Constrained Heterogeneous Computing Systems Using Voltage Scaling,” IEEE Transactions on Parallel and Distributed Systems, 19(11), 2008. DOI: 10.1109/TPDS.2008.113. 사용자가 제공한 PDF를 포함합니다.
