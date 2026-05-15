<template>
<div class="profile-page">

<div class="profile-top-card">
<div class="avatar">
🎓
</div>

<h1>{{ authFullName }}</h1>

<p>{{ userSession?.email }}</p>

<div class="profile-badges">
<span>🔥 {{ streak }} nap</span>
<span>📚 {{ totalDone }} feladat</span>
</div>
</div>

<div class="profile-card">
<h3>Fiók adatok</h3>

<div class="setting-row">
<span>Név</span>

<input
v-model="editableName"
class="profile-input"
/>
</div>

<div class="setting-row">
<span>Email</span>

<input
:value="userSession?.email"
disabled
class="profile-input disabled"
/>
</div>

<div class="setting-row">
<span>Regisztrált</span>

<strong>{{ registrationDate }}</strong>
</div>

<button
class="save-profile-btn"
@click="saveProfile"
>
Mentés
</button>

</div>

<div class="profile-card danger-zone">

<h3>Veszélyzóna</h3>

<button
class="danger-btn"
@click="handleLogout"
>
Kilépés
</button>

<button
class="danger-btn red"
@click="deleteAccount"
>
Fiók törlése
</button>

</div>

</div>
</template>

<script>
import { supabase } from "../supabase"

export default{

props:[
"userSession",
"authFullName",
"stats",
"activityStats"
],

data(){

return{
editableName:this.authFullName
}

},

computed:{

streak(){
return this.activityStats?.streak || 0
},

totalDone(){
return this.stats?.totalDone || 0
},

registrationDate(){

if(!this.userSession?.created_at) return "-"

return new Date(
this.userSession.created_at
).toLocaleDateString("hu-HU")

}

},

methods:{

async saveProfile(){

const {error}=await supabase.auth.updateUser({

data:{
full_name:this.editableName
}

})

if(error){

alert(error.message)

return

}

alert("Profil mentve")

},

handleLogout(){

this.$emit("logout")

},

deleteAccount(){

alert(
"Fiók törlés később kerül bekötésre"
)

}

}

}
</script>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 10px 16px 80px;
  box-sizing: border-box;
  color: white;
}

.profile-top-card,
.profile-card {
  width: 100%;
  margin-bottom: 20px;
  padding: 26px;

  border-radius: 30px;

  background: rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);

  border: 1px solid rgba(255, 255, 255, 0.12);

  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  box-sizing: border-box;
}

.profile-top-card {
  text-align: center;
}

.profile-top-card .avatar {
  width: 96px;
  height: 96px;
  margin: 0 auto 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 32px;

  background: linear-gradient(135deg, #667eea, #764ba2);

  font-size: 3rem;

  box-shadow:
    0 18px 38px rgba(102, 126, 234, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.profile-top-card h1 {
  margin: 0 0 6px;

  color: white;
  font-size: 2rem;
  font-weight: 950;
  letter-spacing: -0.5px;
}

.profile-top-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.58);
  font-weight: 600;
}

.profile-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.profile-badges span {
  padding: 9px 14px;

  border-radius: 999px;

  background: rgba(255, 255, 255, 0.08);

  border: 1px solid rgba(255, 255, 255, 0.12);

  color: white;
  font-weight: 850;
  font-size: 0.9rem;
}

.profile-card h3 {
  margin: 0 0 20px;
  padding-bottom: 12px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  color: white;
  font-size: 1.15rem;
  font-weight: 900;
}

.setting-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  gap: 14px;

  padding: 14px 0;

  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.setting-row:last-of-type {
  border-bottom: none;
}

.setting-row span {
  color: rgba(255, 255, 255, 0.58);
  font-weight: 800;
}

.setting-row strong {
  color: white;
  font-weight: 900;
}

.profile-input {
  width: 100%;
  padding: 13px 15px;

  border-radius: 16px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(0, 0, 0, 0.22);

  color: white;

  font-size: 1rem;
  font-weight: 700;

  outline: none;
  box-sizing: border-box;
}

.profile-input:focus {
  border-color: rgba(102, 126, 234, 0.8);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.profile-input.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.save-profile-btn {
  width: 100%;
  margin-top: 22px;
  padding: 14px 18px;

  border: none;
  border-radius: 999px;

  background: linear-gradient(135deg, #2ecc71, #27ae60);

  color: white;
  font-weight: 950;
  font-size: 1rem;

  cursor: pointer;
  transition: 0.25s ease;
}

.save-profile-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.danger-zone {
  border-color: rgba(231, 76, 60, 0.22);
}

.danger-zone h3 {
  color: #ff7676;
}

.danger-btn {
  width: 100%;
  margin-top: 10px;
  padding: 14px 18px;

  border-radius: 999px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(255, 255, 255, 0.06);

  color: white;
  font-weight: 900;

  cursor: pointer;
  transition: 0.25s ease;
}

.danger-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.danger-btn.red {
  border-color: rgba(231, 76, 60, 0.4);
  background: rgba(231, 76, 60, 0.12);
  color: #ff7676;
}

.danger-btn.red:hover {
  background: rgba(231, 76, 60, 0.25);
}

@media (max-width: 700px) {
  .profile-page {
    padding: 0 4px 110px;
  }

  .profile-top-card,
  .profile-card {
    padding: 22px;
    border-radius: 26px;
  }

  .profile-top-card .avatar {
    width: 82px;
    height: 82px;
    border-radius: 28px;
    font-size: 2.4rem;
  }

  .profile-top-card h1 {
    font-size: 1.55rem;
  }

  .setting-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>