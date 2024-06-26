import { initializeIcons } from '@fluentui/react';
import Konva from 'konva';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

initializeIcons();

Konva.angleDeg = true;

const container = document.getElementById('root');
if (!container) {
    throw new Error('Missing #root element');
}

const root = createRoot(container);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);
