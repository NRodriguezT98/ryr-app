import React from "react";
import { Image, StyleSheet } from "@react-pdf/renderer";
import pieDePagina from "../../assets/pieDePagina.png";

const styles = StyleSheet.create({
    footerImage: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%"
    }
});

const PDFFooter = () => (
    <Image src={pieDePagina} style={styles.footerImage} fixed />
);

export default PDFFooter;
