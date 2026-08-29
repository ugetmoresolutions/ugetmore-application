"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X, ShoppingCart, Eye } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertData {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }[];
}

interface SmartAlertProps {
  alerts: AlertData[];
  onRemove: (id: string) => void;
}

const SmartAlert: React.FC<SmartAlertProps> = ({ alerts, onRemove }) => {
  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const AlertItem: React.FC<{ alert: AlertData }> = ({ alert }) => {
    const config = getAlertConfig(alert.type);
    const Icon = config.icon;

    useEffect(() => {
      if (alert.duration && alert.duration > 0) {
        const timer = setTimeout(() => {
          onRemove(alert.id);
        }, alert.duration);

        return () => clearTimeout(timer);
      }
    }, [alert]);

    return (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 shadow-lg backdrop-blur-sm`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {alert.title}
            </h4>
            <p className={`text-sm ${config.messageColor}`}>
              {alert.message}
            </p>
            
            {alert.actions && alert.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {alert.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.action();
                      onRemove(alert.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                      action.variant === 'primary'
                        ? 'bg-[#155670] text-white hover:bg-[#0d3d47]'
                        : `${config.titleColor} hover:bg-white/50`
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onRemove(alert.id)}
            className={`flex-shrink-0 ${config.iconColor} hover:bg-white/50 rounded-lg p-1 transition-colors duration-200`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {alerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing alerts
export const useSmartAlert = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const showAlert = (alertData: Omit<AlertData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newAlert: AlertData = {
      ...alertData,
      id,
      duration: alertData.duration ?? 5000
    };
    
    setAlerts(prev => [...prev, newAlert]);
    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Convenience methods
  const success = (title: string, message: string, actions?: AlertData['actions']) => {
    return showAlert({ type: 'success', title, message, actions });
  };

  const error = (title: string, message: string, actions?: AlertData['actions']) => {
    return showAlert({ type: 'error', title, message, actions, duration: 7000 });
  };

  const warning = (title: string, message: string, actions?: AlertData['actions']) => {
    return showAlert({ type: 'warning', title, message, actions, duration: 6000 });
  };

  const info = (title: string, message: string, actions?: AlertData['actions']) => {
    return showAlert({ type: 'info', title, message, actions });
  };

  return {
    alerts,
    showAlert,
    removeAlert,
    clearAllAlerts,
    success,
    error,
    warning,
    info,
    AlertComponent: () => <SmartAlert alerts={alerts} onRemove={removeAlert} />
  };
};

export default SmartAlert;