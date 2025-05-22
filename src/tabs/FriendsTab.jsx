// FriendsTab.jsx — вкладка с вводом реферального кода и списком друзей
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function FriendsTab() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [referrer, setReferrer] = useState("");
  const [refCodeInput, setRefCodeInput] = useState("");
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const tg = window?.Telegram?.WebApp?.initDataUnsafe;
    if (tg?.user) {
      setUserId(tg.user.id.toString());
      setUsername(tg.user.username || tg.user.first_name || "Вы");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "users", userId);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setReferrer(data.referrer || "");
        loadFriends();
      }
    });
  }, [userId]);

  const loadFriends = async () => {
    const q = query(collection(db, "users"), where("referrer", "==", userId));
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((doc) => list.push(doc.data()));
    setFriends(list);
  };

  const submitRefCode = async () => {
    if (!refCodeInput || referrer || refCodeInput === userId) return;

    const myRef = doc(db, "users", userId);
    const inviterRef = doc(db, "users", refCodeInput);
    const inviterSnap = await getDoc(inviterRef);

    if (!inviterSnap.exists()) return alert("Код недействителен");

    await updateDoc(myRef, {
      referrer: refCodeInput,
      coins: 100 // бонус за привязку
    });

    const inviterData = inviterSnap.data();
    await updateDoc(inviterRef, {
      coins: (inviterData.coins || 0) + 200 // бонус за приглашение
    });

    setReferrer(refCodeInput);
    loadFriends();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-yellow-300 text-center">👥 Приглашения</h2>

      {!referrer ? (
        <div className="flex gap-2">
          <Input
            className="bg-[#1c1c1e] border border-gray-700 px-3 py-2 rounded-md text-sm w-full"
            placeholder="Введите код друга"
            value={refCodeInput}
            onChange={(e) => setRefCodeInput(e.target.value)}
          />
          <Button onClick={submitRefCode}>Привязать</Button>
        </div>
      ) : (
        <div className="text-sm text-green-400 text-center">Вы уже указали пригласителя</div>
      )}

      <div className="bg-[#2e2e30] p-4 rounded-xl">
        <h3 className="font-bold mb-2">Ваш код:</h3>
        <div className="text-center font-mono">{userId}</div>
      </div>

      <div className="bg-[#2e2e30] p-4 rounded-xl">
        <h3 className="font-bold mb-2">Ваши друзья:</h3>
        {friends.length === 0 && <div className="text-sm text-gray-400">Пока никого</div>}
        {friends.map((f, i) => (
          <div key={i} className="flex justify-between text-sm border-b border-gray-600 py-1">
            <span>@{f.username || "приглашённый"}</span>
            <span>{f.coinsPerHour || 0}/ч</span>
          </div>
        ))}
      </div>
    </div>
  );
}
