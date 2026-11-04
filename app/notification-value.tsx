'use client';
import type {CSSProperties} from 'react';
import type {NotificationValue} from './planning-notification-types';
import {colorStyle} from './planning-types';
export default function NotificationValueCell({value}:{value:NotificationValue}){return <span className="notice-cell" style={colorStyle(value.color) as CSSProperties}>{value.text||'Tomt'}</span>}
