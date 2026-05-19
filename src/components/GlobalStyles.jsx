const GLOBAL_CSS = `
*{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
html,body,#root{margin:0;padding:0;width:100%;min-height:100vh;overflow:hidden;}
#root{border:none;}
input,textarea{font-size:16px!important;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`;

const GLOBAL_OVERRIDE_CSS = `
/* Welcome modal white text override */
.welcome-modal, .welcome-modal * { color: #fff !important; }
.welcome-modal input, .welcome-modal textarea, .welcome-modal button, .welcome-modal a { color: #fff !important; }
.welcome-modal svg { color: #fff !important; }
.welcome-modal ::selection { color: #fff !important; background: rgba(255,255,255,0.12) !important; }
`;

export default function GlobalStyles({ bodyCss }) {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{GLOBAL_OVERRIDE_CSS}</style>
      <style>{`body{${bodyCss}}`}</style>
    </>
  );
}
