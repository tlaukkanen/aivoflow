"use client";

import {
  AppBar,
  Toolbar as MUIToolbar,
  Box,
  Typography,
  Button,
  Link,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { signIn, signOut, useSession } from "next-auth/react";
import { PiUser } from "react-icons/pi";

import { OpenProjectDialog } from "./open-project-dialog";

import { useEditor } from "@/store/editor-context";
import { logger } from "@/services/logger";

interface MenubarProps {
  onNewProject: () => void;
  onCopyJsonToClipboard: () => void;
  onSaveMindMap?: () => void; // Add this prop
}

export const Menubar = ({
  onNewProject,
  onCopyJsonToClipboard,
  onSaveMindMap, // Add this prop
}: MenubarProps) => {
  const { getNodes } = useReactFlow();
  const { isFullScreen } = useEditor();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [editAnchorEl, setEditAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const [profileAchorEl, setProfileAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [openProjectDialogOpen, setOpenProjectDialogOpen] = useState(false);
  const projectMenuOpen = Boolean(anchorEl);
  const editMenuOpen = Boolean(editAnchorEl);
  const profileMenuOpen = Boolean(profileAchorEl);
  const { data: session } = useSession();

  const handleProjectMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleEditMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setEditAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setEditAnchorEl(null);
    setProfileAnchorEl(null);
    setEditAnchorEl(null);
  };

  const downloadImage = (dataUrl: string) => {
    const a = document.createElement("a");

    a.setAttribute("download", "reactflow.png");
    a.setAttribute("href", dataUrl);
    a.click();
  };

  const handleCopyAsImage = () => {
    handleMenuClose();
    const nodesBounds = getNodesBounds(getNodes());

    logger.debug("Nodes bounds", nodesBounds);
    const imageWidth = nodesBounds.width + 200;
    const imageHeight = nodesBounds.height + 200;
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      0.03,
    );

    logger.debug("Viewport", viewport);

    const element = document.querySelector(".react-flow__viewport");

    if (!element) return;

    toPng(element as HTMLElement, {
      backgroundColor: "#fff",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: String(imageWidth),
        height: String(imageHeight),
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);

    toast.info(`Downloading image: ${viewport.x}x${viewport.y}`);
  };

  if (isFullScreen) {
    return null;
  }

  return (
    <>
      <AppBar
        className="bg-menuBar-background shadow-stone-800 shadow-md text-panels-text border-b border-solid border-0 border-panels-border"
        elevation={0}
        position="sticky"
      >
        <MUIToolbar
          className="bg-menuBar-background border-b  border-b-panels-border text-menuBar-text"
          variant="dense"
        >
          <Box
            sx={{
              flex: "2 1 auto",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Link
              className="flex justify-start items-center gap-1 text-prussianBlue"
              href="/"
              underline="none"
            >
              <Image
                alt="Logo"
                className="w-8 h-8 object-contain"
                height={28}
                src="/app_icon.svg"
                width={28}
              />
              <Box width={1} />
              <Typography className="hidden sm:block font-extrabold text-menuBar-text">
                AivoMind
              </Typography>
            </Link>
            <div className="flex gap-0">
              <Button
                className="text-xs"
                color="inherit"
                size="small"
                onClick={handleProjectMenuClick}
              >
                Project
              </Button>
              <Menu
                MenuListProps={{
                  "aria-labelledby": "project-menu",
                }}
                anchorEl={anchorEl}
                id="project-menu"
                open={projectMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    onNewProject();
                    handleMenuClose();
                  }}
                >
                  New Project
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setOpenProjectDialogOpen(true);
                  }}
                >
                  Open Project
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onSaveMindMap?.();
                    handleMenuClose();
                  }}
                >
                  Save Project
                </MenuItem>
                <MenuItem disabled onClick={handleMenuClose}>
                  Export (Coming later)
                </MenuItem>
              </Menu>
              <Button
                className="text-xs"
                color="inherit"
                size="small"
                onClick={handleEditMenuClick}
              >
                Edit
              </Button>
              <Menu
                MenuListProps={{
                  "aria-labelledby": "edit-menu",
                }}
                anchorEl={editAnchorEl}
                id="edit-menu"
                open={editMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleCopyAsImage}>Save as image</MenuItem>
                <MenuItem onClick={onCopyJsonToClipboard}>
                  Copy as JSON to clipboard
                </MenuItem>
                <MenuItem disabled onClick={handleMenuClose}>
                  Still in progress
                </MenuItem>
                <MenuItem disabled onClick={handleMenuClose}>
                  Still in progress
                </MenuItem>
              </Menu>
            </div>
          </Box>
          <Box
            sx={{
              flex: "3 1 auto",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box className="hidden sm:flex items-center gap-3 border-1 rounded-md px-2 text-xs text-gray-400">
              ⚠️ Beta {process.env.NEXT_PUBLIC_VERSION_TAG || "v0.0.0"}
            </Box>
            {session ? (
              <>
                <IconButton
                  aria-label="Profile menu"
                  className="bg-toolBar-background text-white"
                  size="small"
                  onClick={handleProfileMenuClick}
                >
                  <PiUser />
                </IconButton>
                <Menu
                  MenuListProps={{
                    "aria-labelledby": "profile-menu",
                  }}
                  anchorEl={profileAchorEl}
                  id="profile-menu"
                  open={profileMenuOpen}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                className="bg-toolBar-background text-white"
                size="small"
                variant="contained"
                onClick={() => {
                  signIn();
                }}
              >
                Sign in
              </Button>
            )}
          </Box>
        </MUIToolbar>
      </AppBar>
      <OpenProjectDialog
        open={openProjectDialogOpen}
        onClose={() => setOpenProjectDialogOpen(false)}
      />
    </>
  );
};
