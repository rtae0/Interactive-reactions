# 🎨 Interactive Reactions

**웹캠 기반 손 인식 드로잉 & 반응 이모지 애플리케이션**  
A hand-tracking interactive drawing tool with emoji reactions using ml5.js & p5.js.

---

## 📌 소개 (Introduction)

**Interactive Reactions**는 사용자의 손을 웹캠으로 인식하여 화면 위에 그림을 그리고, 반응 이모지를 띄울 수 있는 웹 기반 인터랙티브 애플리케이션입니다. 손가락을 모아 클릭하듯 제스처하면 다양한 동작(그리기, 지우기, 색상 선택, 이모지 반응)이 실행됩니다.

---

## ✨ 주요 기능 (Features)
| 기능 | 설명 |
|------|------|
| 🖌️ **드로잉 모드** | 검지 손가락으로 화면에 그림을 그릴 수 있습니다. |
| 🧼 **지우개 모드** | 버튼을 눌러 지우개로 전환 후 그림 일부를 제거할 수 있습니다. |
| 🎨 **컬러 선택** | 빨강, 파랑, 초록 중 원하는 색을 선택하여 그릴 수 있습니다. |
| 😄 **반응 이모지** | ❤️, 👍, 😢 이모지를 화면에 떠오르게 만들 수 있습니다. |
| 📹 **실시간 웹캠 피드** | 배경에 웹캠 영상이 실시간으로 표시됩니다. |
| ✋ **HandPose 인식** | ml5.js의 HandPose 모델을 통해 손가락 위치를 감지합니다. |

⸻

📁 폴더 구조
```
Interactive-reactions/
├── index.html        # 메인 HTML
├── sketch.js         # p5.js 및 기능 구현
├── style.css         # 선택 사항 (스타일)
├── assets/           # 데모 이미지 또는 아이콘
└── README.md         # 이 문서
```
