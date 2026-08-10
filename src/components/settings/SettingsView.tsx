import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, RefreshCw, Trash2, Key, Sliders, Shield, Bell, BellOff, Clock, Send, Info, RotateCcw } from 'lucide-react';
import { UserSettings } from '../../types';
import { resetAllData, resetReviewStats } from '../../lib/storage';
import { requestNotificationPermission, getNotificationPermission, sendTestNotification, sendTelegramNotification } from '../../lib/notifications';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onResetStats?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onResetStats }) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>(getNotificationPermission());
  const [testSentMessage, setTestSentMessage] = useState(false);
  const [telegramTestSentMessage, setTelegramTestSentMessage] = useState(false);
  const [telegramTestError, setTelegramTestError] = useState<string | null>(null);
  const [isResetStatsModalOpen, setIsResetStatsModalOpen] = useState(false);
  const [statsResetSuccess, setStatsResetSuccess] = useState(false);

  useEffect(() => {
    setPermissionState(getNotificationPermission());
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const perm = await requestNotificationPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        onUpdateSettings({ notificationsEnabled: true });
      } else {
        alert('Les notifications sont bloquées par votre navigateur. Veuillez les autoriser dans les paramètres du navigateur.');
        onUpdateSettings({ notificationsEnabled: false });
      }
    } else {
      onUpdateSettings({ notificationsEnabled: false });
    }
  };

  const handleTestNotification = async () => {
    if (permissionState !== 'granted') {
      const perm = await requestNotificationPermission();
      setPermissionState(perm);
      if (perm !== 'granted') return;
    }
    await sendTestNotification(5);
    setTestSentMessage(true);
    setTimeout(() => setTestSentMessage(false), 3000);
  };

  const handleTestTelegramNotification = async () => {
    const token = settings.telegramBotToken;
    const chatId = settings.telegramChatId;
    if (!token || !chatId) {
      setTelegramTestError('Veuillez renseigner le Token de Bot et le Chat ID.');
      setTimeout(() => setTelegramTestError(null), 4000);
      return;
    }
    setTelegramTestError(null);
    const success = await sendTelegramNotification(
      token,
      chatId,
      `📚 <b>Test Memora</b>\n\nFélicitations ! Vos notifications Telegram sont parfaitement configurées. 🔥`
    );
    if (success) {
      setTelegramTestSentMessage(true);
      setTimeout(() => setTelegramTestSentMessage(false), 4000);
    } else {
      setTelegramTestError('Erreur d\'envoi. Vérifiez le token, le Chat ID ou si vous avez lancé le bot.');
      setTimeout(() => setTelegramTestError(null), 5000);
    }
  };

  const handleReset = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de l\'application aux données de démonstration ?')) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Paramètres & Préférences MEMORA
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Personnalisez votre expérience de répétition espacée, l'apparence et les limites de révision.
        </p>
      </div>

      {/* Notifications Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
              Rappels & Notifications
            </h3>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            permissionState === 'granted'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              : permissionState === 'denied'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
          }`}>
            {permissionState === 'granted' ? 'Autorisé' : permissionState === 'denied' ? 'Bloqué' : 'Non configuré'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                Rappel quotidien de révision
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Recevez une notification chaque jour à l'heure sélectionnée s'il y a des cartes à réviser.
              </span>
            </div>
            <button
              onClick={() => handleToggleNotifications(!settings.notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.notificationsEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Heure du rappel quotidien :
                </label>
                <input
                  type="time"
                  value={settings.notificationTime || '09:00'}
                  onChange={(e) => onUpdateSettings({ notificationTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleTestNotification}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{testSentMessage ? 'Notification envoyée !' : 'Tester la notification'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

          {/* Telegram Notifications */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                  Rappels Telegram (Mobile)
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                  Recevez des rappels quotidiens directement sur votre téléphone via un bot Telegram personnalisé.
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ telegramNotificationsEnabled: !settings.telegramNotificationsEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.telegramNotificationsEnabled ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.telegramNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.telegramNotificationsEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Token de Bot Telegram :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 123456789:ABCdefGh..."
                      value={settings.telegramBotToken || ''}
                      onChange={(e) => onUpdateSettings({ telegramBotToken: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      ID de Chat Telegram :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 987654321"
                      value={settings.telegramChatId || ''}
                      onChange={(e) => onUpdateSettings({ telegramChatId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="text-xs text-rose-600 dark:text-rose-400">
                    {telegramTestError && <span>⚠️ {telegramTestError}</span>}
                  </div>
                  <button
                    onClick={handleTestTelegramNotification}
                    className="py-2.5 px-6 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 transition-colors self-end"
                  >
                    <Send className="w-4 h-4" />
                    <span>{telegramTestSentMessage ? 'Message envoyé !' : 'Tester Telegram'}</span>
                  </button>
                </div>

                {/* Setup Instructions Guide */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/30 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs">
                    <Info className="w-4 h-4" />
                    Comment configurer votre Bot Telegram :
                  </div>
                  <ol className="list-decimal pl-5 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1.5 leading-relaxed">
                    <li>Recherchez le contact officiel <b className="text-indigo-600 dark:text-indigo-400">@BotFather</b> sur Telegram.</li>
                    <li>Envoyez la commande <code>/newbot</code> et suivez les étapes pour nommer votre bot.</li>
                    <li>Copiez le token API fourni (ex: <code>123456789:ABCdefGh...</code>) et collez-le dans le champ ci-dessus.</li>
                    <li>Recherchez votre bot créé sur Telegram et envoyez-lui la commande <code>/start</code>.</li>
                    <li>Recherchez le contact <b className="text-indigo-600 dark:text-indigo-400">@userinfobot</b> sur Telegram et envoyez-lui un message pour récupérer votre ID numérique personnel (Chat ID), puis collez-le ci-dessus.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Review Limits Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
            Paramètres de révision & répétition
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Nouvelles cartes maximum par jour
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.newCardsPerDay}
              onChange={(e) => onUpdateSettings({ newCardsPerDay: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Révisions maximum par session
            </label>
            <input
              type="number"
              min={10}
              max={500}
              value={settings.maxReviewsPerDay}
              onChange={(e) => onUpdateSettings({ maxReviewsPerDay: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Objectif quotidien de révision (cartes/jour)
            </label>
            <input
              type="number"
              min={5}
              max={200}
              value={settings.dailyGoal}
              onChange={(e) => onUpdateSettings({ dailyGoal: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Algorithme de révision
            </label>
            <select
              value={settings.algorithm}
              onChange={(e) => onUpdateSettings({ algorithm: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="SM2">SM-2 Adaptatif (Recommandé)</option>
              <option value="LEITNER">Système Leitner classique</option>
              <option value="FSRS">FSRS (Free Spaced Repetition Scheduler)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
            Apparence & Thème
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onUpdateSettings({ theme: 'light' })}
            className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              settings.theme === 'light'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <Sun className="w-5 h-5 mx-auto" />
            <span className="text-xs block">Clair</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              settings.theme === 'dark'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <Moon className="w-5 h-5 mx-auto" />
            <span className="text-xs block">Sombre</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'system' })}
            className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              settings.theme === 'system'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <Monitor className="w-5 h-5 mx-auto" />
            <span className="text-xs block">Système</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheatsheet */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
            Raccourcis Clavier
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
            <span>Afficher la réponse</span>
            <kbd className="px-2 py-1 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 font-mono font-bold">
              ESPACE
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
            <span>Évaluation "À revoir"</span>
            <kbd className="px-2 py-1 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 font-mono font-bold">
              1
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
            <span>Évaluation "Difficile"</span>
            <kbd className="px-2 py-1 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 font-mono font-bold">
              2
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
            <span>Évaluation "Bien"</span>
            <kbd className="px-2 py-1 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 font-mono font-bold">
              3
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
            <span>Évaluation "Facile"</span>
            <kbd className="px-2 py-1 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 font-mono font-bold">
              4
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
            <span>Command Palette / Recherche</span>
            <kbd className="px-2 py-1 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 font-mono font-bold">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <RefreshCw className="w-5 h-5" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">Réinitialisation des Statistiques de Révision</h3>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Remet à zéro le compteur global de cartes révisées, le temps d'étude, la série d'assiduité (streak) et l'historique des révisions sans supprimer vos cartes ni vos decks.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsResetStatsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-900 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser le compteur de révisions</span>
          </button>

          {statsResetSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              ✓ Compteur réinitialisé avec succès !
            </span>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-950 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Trash2 className="w-5 h-5" />
          <h3 className="font-bold text-base">Gestion des Données & Réinitialisation Globale</h3>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Rechargez les données de démonstration d'origine (Histoire, Anglais, Culture Générale, Traduction Militaire) ou effacez le cache local.
        </p>

        <button
          onClick={handleReset}
          className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Réinitialiser toutes les données (Demo)</span>
        </button>
      </div>

      {/* Modal Confirmation Reset Stats */}
      {isResetStatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Réinitialiser le compteur ?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Cette action remettra à zéro vos statistiques d'étude.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Vos cartes et decks seront conservés intacts, mais le total des cartes révisées, le temps passé et votre série de jours d'étude seront remis à 0.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetStatsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetStats) {
                    onResetStats();
                  } else {
                    resetReviewStats();
                  }
                  setIsResetStatsModalOpen(false);
                  setStatsResetSuccess(true);
                  setTimeout(() => setStatsResetSuccess(false), 4000);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer"
              >
                Réinitialiser les statistiques
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
